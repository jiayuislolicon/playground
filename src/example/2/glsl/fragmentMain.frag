// 參照 <normal_fragment_maps> 的最後一行計算
normal = perturbNormalArb(
	-vViewPosition,
	normal,
	vec2(dFdx(vDisplacement), dFdy(vDisplacement)),
	faceDirection
);
