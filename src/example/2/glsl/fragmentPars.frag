// 原先只需要引入這兩段
uniform float uTime;
varying float vDisplacement;

// 但是參照<normal_fragment_maps>檔案後
// 會需要這個 function，因此在這邊複製貼上，重新引入
vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {

    vec3 vSigmaX = dFdx( surf_pos.xyz );
    vec3 vSigmaY = dFdy( surf_pos.xyz );
    vec3 vN = surf_norm; // normalized

    vec3 R1 = cross( vSigmaY, vN );
    vec3 R2 = cross( vN, vSigmaX );

    float fDet = dot( vSigmaX, R1 ) * faceDirection;

    vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
    return normalize( abs( fDet ) * surf_norm - vGrad );

}