precision mediump float;
uniform float time;
uniform vec2 resolution;

vec3 hsv(float h, float s, float v){
    vec4 t = vec4(1., 2. / 3., 1. / 3., 3.);
    vec3 p = abs(fract(vec3(h) + t.xyz) * 6. - vec3(t.w));
    return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0., 1.), s);
}

void main(){
    vec2 x = vec2(-.345, .654);
    vec2 y = vec2(time * .005, 0.);
    vec2 z = (gl_FragCoord.xy * 2. - resolution) / max(resolution.x, resolution.y);
    int j = 0;
    for(int i = 0; i < 360; i++){
        j++; if(length(z) > 2.){break;}
        z = vec2(z.x * z.x - z.y * z.y, 2. * z.x * z.y) + x + y;
    }
    float h = abs(mod(time * 15. - float(j), 360.) / 360.);
    gl_FragColor = vec4(hsv(h, 1., 1.), 1.);
}

