/**
 * single page glsl
 */
(() => {
    window.addEventListener('load', () => {
        var a, b, c, d, e, f, g, p, t, u, v, w, x, y, z;
        b = function(s){return document.getElementById(s)};
        w = window; w.addEventListener('keydown', k, true);
        c = b('c'); g = c.getContext('webgl'); c.width = x = w.innerWidth; c.height = y = w.innerHeight;
        v = g.createShader(g.VERTEX_SHADER); g.shaderSource(v, b('vs').text); g.compileShader(v);
        f = g.createShader(g.FRAGMENT_SHADER); g.shaderSource(f, b('fs').text); g.compileShader(f);
        if(!g.getShaderParameter(v, g.COMPILE_STATUS)){alert(g.getShaderInfoLog(v)); return;}
        if(!g.getShaderParameter(f, g.COMPILE_STATUS)){alert(g.getShaderInfoLog(f)); return;}
        p = g.createProgram(); g.attachShader(p, v); g.attachShader(p, f); g.linkProgram(p);
        if(!g.getProgramParameter(p, g.LINK_STATUS)){alert(g.getProgramInfoLog(p)); return;}
        e = (p != null); g.useProgram(p); u = [];
        u[0] = g.getUniformLocation(p, 't'); u[1] = g.getUniformLocation(p, 'r');
        g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
        g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1,1,0,-1,-1,0,1,1,0,1,-1,0]), g.STATIC_DRAW);
        a = g.getAttribLocation(p, 'position');
        g.enableVertexAttribArray(a); g.vertexAttribPointer(a, 3, g.FLOAT, false, 0, 0);
        g.clearColor(0, 0, 0, 1); z = new Date().getTime();
        (function(){if(!e){return;} c.width = x = w.innerWidth; c.height = y = w.innerHeight;
            g.viewport(0, 0, x, y); d = (new Date().getTime() - z) * 0.001;
            g.clear(g.COLOR_BUFFER_BIT); g.uniform1f(u[0], d); g.uniform2fv(u[1], [x, y]);
            g.drawArrays(g.TRIANGLE_STRIP, 0, 4); g.flush(); setTimeout(arguments.callee, 16);
        })();
        function k(h){e = (h.keyCode !== 27);}
    }, false);
})();

