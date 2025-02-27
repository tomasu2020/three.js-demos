import * as THREE from '../../build/three.module.js';
import { BufferGeometryUtils } from '../../utils/BufferGeometryUtils.js';
import {GLOBAL} from './global.js';

function generateGeometry( objectType, numObjects ) {

        function applyVertexColors( geometry, color ) {

          const position = geometry.attributes.position;
          const colors = [];

          for ( let i = 0; i < position.count; i ++ ) {

            colors.push( color.r, color.g, color.b );

          }

          geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

        }

        const geometries = [];

        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const rotation = new THREE.Euler();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        const color = new THREE.Color();

        for ( let i = 0; i < numObjects; i ++ ) {

          position.x = Math.random() * 10000 - 5000;
          position.y = Math.random() * 6000 - 3000;
          position.z = Math.random() * 8000 - 4000;

          rotation.x = Math.random() * 2 * Math.PI;
          rotation.y = Math.random() * 2 * Math.PI;
          rotation.z = Math.random() * 2 * Math.PI;
          quaternion.setFromEuler( rotation );

          scale.x = Math.random() * 200 + 100;

          let geometry;

          if ( objectType === 'cube' ) {

            geometry = new THREE.BoxGeometry( 1, 1, 1 );
            geometry = geometry.toNonIndexed(); // merging needs consistent buffer geometries
            scale.y = Math.random() * 200 + 100;
            scale.z = Math.random() * 200 + 100;
            color.setRGB( 0, 0, 0.1 + 0.9 * Math.random() );

          } else if ( objectType === 'sphere' ) {

            geometry = new THREE.IcosahedronGeometry( 1, 1 );
            scale.y = scale.z = scale.x;
            color.setRGB( 0.1 + 0.9 * Math.random(), 0, 0 );

          }

          // give the geom's vertices a random color, to be displayed
          applyVertexColors( geometry, color );

          matrix.compose( position, quaternion, scale );
          geometry.applyMatrix4( matrix );

          geometries.push( geometry );

        }

        return BufferGeometryUtils.mergeBufferGeometries( geometries );

      }

export function FXScene( type, numObjects, cameraZ, fov, rotationSpeed, clearColor ) {

        this.clearColor = clearColor;

        this.camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 10000 );
        this.camera.position.z = cameraZ;

        // Setup scene
        this.scene = new THREE.Scene();
        this.scene.add( new THREE.AmbientLight( 0x555555 ) );

        const light = new THREE.SpotLight( 0xffffff, 1.5 );
        light.position.set( 0, 500, 2000 );
        this.scene.add( light );

        this.rotationSpeed = rotationSpeed;

        const defaultMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true, vertexColors: true } );
        this.mesh = new THREE.Mesh( generateGeometry( type, numObjects ), defaultMaterial );
        this.scene.add( this.mesh );

        const renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
        this.fbo = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );

        this.render = function ( delta, rtt ) {

          this.mesh.rotation.x += delta * this.rotationSpeed.x;
          this.mesh.rotation.y += delta * this.rotationSpeed.y;
          this.mesh.rotation.z += delta * this.rotationSpeed.z;

          GLOBAL.renderer.setClearColor( this.clearColor );

          if ( rtt ) {

            GLOBAL.renderer.setRenderTarget( this.fbo );
            GLOBAL.renderer.clear();
            GLOBAL.renderer.render( this.scene, this.camera );

          } else {

            GLOBAL.renderer.setRenderTarget( null );
            GLOBAL.renderer.render( this.scene, this.camera );

          }

        };

      }
