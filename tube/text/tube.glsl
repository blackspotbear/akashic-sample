#version 100

precision mediump float;

#define PI 3.1415926535

// テクスチャ。
uniform sampler2D uSampler;

// UV座標。
varying vec2 vTexCoord;

// シェーダが適用される画像の横幅。
uniform float image_width;

// シェーダが適用される画像の縦幅。
uniform float image_height;

// 円筒のZ回転角。
uniform float rotZ;

// 矩形上のUV座標を３次元座標系に変換する。
vec2 toScreenSpaceXY(vec2 uv) {
    vec2 xy = vec2(uv.x, 1. - uv.y) * 2. - vec2(1., 1.);

    if (image_width >= image_height)
        xy.x *= image_width / image_height;
    else
        xy.y *= image_height / image_width;

    return xy;
}

// 回転行列を作る。
mat2 rotationMatrix(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, +s, c);
}

void main () {
    vec2 p = toScreenSpaceXY(vTexCoord);

    // シリンダー半径。
    float cr = 0.9;

    // シリンダーの円周の長さ。
    float C = 2. * PI * cr;

    // シリンダーの高さ（Z方向の長さ）。
    float H = C * (image_height / image_width);

    // カメラ（視点）の位置。
    vec3 c = vec3(.0, .0, -1.);

    // レイ。
    vec3 ray;

    // レイの方向(XY成分)
    ray.xy = p - c.xy;

    // レイのXY成分の長さ。
    float l = length(ray.xy);

    // 円筒の外は黒くする。
    if (l > cr) {
        gl_FragColor = vec4(0., 0., 0., 1.);
        return;
    }

    // ray と 円筒の交差点のZ座標。
    ray.z = (1. - cr / l) * c.z;

    // 円筒の先端より先にレイが伸びている時、黒くする。
    if (ray.z > H) {
        gl_FragColor = vec4(0., 0., 0., 1.);
        return;
    }

    // 円筒を回転させるため、レイの方向(XY成分)を逆回転させる。
    ray.xy = rotationMatrix(-rotZ) * ray.xy;

    // 0時の方向から反時計回りになるようにする。
    float th = atan(ray.x, -ray.y);
    float u = (th + PI) / 2. / PI;
    float v = ray.z / H;

    gl_FragColor = texture2D(uSampler, vec2(u, v));
}
