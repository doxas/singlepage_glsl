/**
 * single page glsl
 */
(() => {
    window.addEventListener('load', () => {
        let canvas = null;
        let gl = null;
        let program = null;
        let run = true;
        let time = 0;
        let startTime = 0;
        let attribLocation = null;
        let uniformLocation = null;
        let vertex = null;
        let vertexSource = '';
        let fragment = null;
        let fragmentSource = '';
        let width = 0;
        let height = 0;
        window.addEventListener('keydown', (eve) => {
            run = (eve.keyCode !== 27);
        }, true);
        canvas = document.getElementById('webglcanvas');
        gl = canvas.getContext('webgl');
        loadSourceFromFile('./vertex.vert', (err, source) => {
            if(err){
                alert('vertex shader load failed');
                return;
            }
            vertexSource = source;
            loadSourceFromFile('./fragment.frag', (err, source) => {
                if(err){
                    alert('fragment shader load failed');
                    return;
                }
                fragmentSource = source;
                init();
            });
        });
        function init(){
            vertex = compileShader(gl.VERTEX_SHADER, vertexSource);
            fragment = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
            if(vertex === null || fragment === null){return;}
            program = gl.createProgram();
            gl.attachShader(program, vertex);
            gl.attachShader(program, fragment);
            gl.linkProgram(program);
            if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
                alert(gl.getProgramInfoLog(program));
                return;
            }
            gl.useProgram(program);
            uniformLocation = {};
            uniformLocation.time = gl.getUniformLocation(program, 'time');
            uniformLocation.reso = gl.getUniformLocation(program, 'resolution');
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,0,-1,-1,0,1,1,0,1,-1,0]), gl.STATIC_DRAW);
            attribLocation = gl.getAttribLocation(program, 'position');
            gl.enableVertexAttribArray(attribLocation);
            gl.vertexAttribPointer(attribLocation, 3, gl.FLOAT, false, 0, 0);
            gl.clearColor(0.0, 0.0, 0.0, 1);
            startTime = new Date().getTime();
            render();
        }
        function render(){
            if(!run){return;}
            requestAnimationFrame(render);
            time = (new Date().getTime() - startTime) * 0.001;
            canvas.width = width = window.innerWidth;
            canvas.height = height = window.innerHeight;
            gl.viewport(0, 0, width, height);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.uniform1f(uniformLocation.time, time);
            gl.uniform2fv(uniformLocation.reso, [width, height]);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.flush();
        };
        function loadSourceFromFile(path, callback){
            let xhr = new XMLHttpRequest();
            xhr.open('GET', path);
            xhr.onload = () => {
                if(xhr.status === 200){
                    callback(null, xhr.response);
                }else{
                    callback(xhr.status);
                }
            };
            xhr.send();
        }
        function compileShader(target, source){
            let shader = gl.createShader(target);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
                alert(gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        }
    }, false);
})();

