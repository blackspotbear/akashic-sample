#version 100

precision mediump float;

uniform sampler2D uSampler;
varying vec2 vTexCoord;

// テクスチャの解像度。
uniform float image_width;
uniform float image_height;

// スポットライトのパラメータ。
// スポットライトの位置。
uniform float light_pos_x;
uniform float light_pos_y;
uniform float light_pos_z;
// スポットライトの方向。
uniform float light_dir_x;
uniform float light_dir_y;
uniform float light_dir_z;
// スポットライトの明るさ。
uniform float light_intensity;
// スポットライトの範囲。
uniform float light_cutoff;
// スポットライトの指数（大きくなるほど速く減衰する）。
uniform float light_exp;
// 環境光。スポットライトの範囲外の明るさ。
uniform float light_ambient;

uniform int show_normal;

/**
 * スポットライトの計算
 *
 * uv: スポットライトで照らされる画像上の位置。
 * n: 画像の法線。
 * lightPos: スポットライトの位置。
 * loightDir: スポットライトの向き。
 * cutoff: スポットライトの範囲。
 * itensity: スポットライトの明るさ。
 */
float spotLighting(vec2 uv, vec3 n, vec3 lightPos, vec3 spotDir, float cutoff, float exponent, float intensity) {
    vec3 lightDir = normalize(lightPos - vec3(uv, 0.));
    float spotCos = dot(spotDir, -lightDir);
    if (spotCos >= cutoff) {
        return max(dot(n, lightDir), 0.) * pow(spotCos, exponent) * intensity;
    } else {
        return 0.;
    }
}

void main() {
    vec2 uv = vTexCoord;

    float du = 1. / image_width;
    float dv = 1. / image_height;

    // uv の位置と、その周辺の位置のカラーの取得。
    vec4 colc = texture2D(uSampler, uv);
    vec4 coll = texture2D(uSampler, uv + vec2(-du,  0.));
    vec4 colt = texture2D(uSampler, uv + vec2( 0., -dv));
    vec4 colr = texture2D(uSampler, uv + vec2( du,  0.));
    vec4 colb = texture2D(uSampler, uv + vec2( 0.,  dv));

    // 輝度の算出。
    vec3 coef = vec3(0.299, 0.587, 0.114);
    float gc = dot(colc.rgb, coef);
    float gl = dot(coll.rgb, coef);
    float gt = dot(colt.rgb, coef);
    float gr = dot(colr.rgb, coef);
    float gb = dot(colb.rgb, coef);

    // 輝度に基づいた法線の算出。
    vec3 n1 = normalize(vec3(-(gc - gl), 0., du));
    vec3 n2 = normalize(vec3(-(gr - gc), 0., du));
    vec3 n3 = normalize(vec3(0., -(gc - gt), dv));
    vec3 n4 = normalize(vec3(0., -(gb - gc), dv));
    vec3 n = normalize(n1 + n2 + n3 + n4);

    if (show_normal != 0) {
        gl_FragColor = vec4((n + vec3(1.)) / 2., 1.);
        return;
    }

    // 光源の位置。
    vec3 lightPos = vec3(light_pos_x, light_pos_y, light_pos_z);

    // スポットライトの方向。
    vec3 spotDir = normalize(vec3(light_dir_x, light_dir_y, light_dir_z));

    // スポットライトの強さ。
    float intensity = spotLighting(uv, n, lightPos, spotDir, light_cutoff, light_exp, light_intensity);

    // 環境光の色。
    vec3 ambient = vec3(light_ambient);

    // スポットライトの色。
    vec3 lightColor = vec3(1., 1., 1.);

    gl_FragColor = vec4(colc.rgb * ambient + colc.rgb * lightColor * intensity, 1.);
}
