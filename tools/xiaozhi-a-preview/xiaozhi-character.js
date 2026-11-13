/**
 * 小知 A · 自研程序化半身 v2
 * 色板见 COLORS.md（品牌 #2F5FE0）
 */
import * as THREE from 'three'

export const XZ = {
  skin: '#E8C4A8',
  cheek: '#D4A090',
  hair: '#4A2F26',
  hairHi: '#6B4538',
  suit: '#B8BEC6',
  suitDark: '#9AA1AB',
  shirt: '#F4F5F7',
  brand: '#2F5FE0',
  brandDark: '#1E4BC4',
  lip: '#C07A6C',
  eyeWhite: '#FFFEF9',
  pupil: '#1A1210',
  badge: '#FFFFFF',
  bg: '#E8ECF2',
}

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.55,
    metalness: opts.metalness ?? 0.02,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    transparent: opts.opacity != null && opts.opacity < 1,
    opacity: opts.opacity ?? 1,
  })
}

function add(parent, geo, material, pos, rot, scale) {
  const m = new THREE.Mesh(geo, material)
  if (pos) m.position.set(pos[0], pos[1], pos[2])
  if (rot) m.rotation.set(rot[0], rot[1], rot[2])
  if (scale) m.scale.set(scale[0], scale[1], scale[2])
  parent.add(m)
  return m
}

function makeEye(x) {
  const g = new THREE.Group()
  g.position.set(x, 0.055, 0.318)
  const open = new THREE.Group()
  g.add(open)

  // 眼窝微凹（肤色环）
  add(open, new THREE.SphereGeometry(0.078, 20, 20), mat(XZ.skin, { roughness: 0.55 }), [0, 0, -0.01], null, [1.05, 0.85, 0.45])

  const white = add(
    open,
    new THREE.SphereGeometry(0.068, 20, 20),
    mat(XZ.eyeWhite, { roughness: 0.28 }),
    null,
    null,
    [1.15, 1.28, 0.55],
  )

  // 虹膜深褐 + 瞳孔（贴前，避免「对眼/漂」）
  add(open, new THREE.SphereGeometry(0.034, 16, 16), mat('#3D2918', { roughness: 0.35 }), [0, 0.002, 0.032])
  add(open, new THREE.SphereGeometry(0.022, 14, 14), mat(XZ.pupil, { roughness: 0.2 }), [0, 0.004, 0.042])
  add(
    open,
    new THREE.SphereGeometry(0.009, 8, 8),
    mat('#ffffff', { roughness: 0.1, emissive: '#ffffff', emissiveIntensity: 0.55 }),
    [0.008, 0.014, 0.055],
  )

  // 上睑 + 睫毛线
  add(g, new THREE.BoxGeometry(0.13, 0.022, 0.04), mat(XZ.skin, { roughness: 0.5 }), [0, 0.062, 0.02], [0.4, 0, 0])
  add(g, new THREE.BoxGeometry(0.125, 0.01, 0.02), mat(XZ.hair, { roughness: 0.65 }), [0, 0.078, 0.035], [0.15, 0, 0])

  const brow = add(
    g,
    new THREE.CapsuleGeometry(0.008, 0.075, 4, 8),
    mat(XZ.hair, { roughness: 0.7 }),
    [0, 0.112, 0.01],
    [0.05, 0, x < 0 ? 0.08 : -0.08],
  )

  g.userData = { open, brow, white, x }
  return g
}

/** @returns {{ root: THREE.Group, head: THREE.Group, torso: THREE.Group, leftArm: THREE.Group, rightArm: THREE.Group, eyes: THREE.Group[] }} */
export function createXiaoZhiA() {
  const root = new THREE.Group()
  root.name = 'xiaozhi-a-v2'

  const head = new THREE.Group()
  head.position.set(0, 0.36, 0)
  root.add(head)

  // 头：略扁竖椭圆，少「正圆气球」
  add(head, new THREE.SphereGeometry(0.33, 48, 48), mat(XZ.skin, { roughness: 0.48 }), null, null, [1.02, 1.08, 0.95])
  // 下颌
  add(head, new THREE.SphereGeometry(0.2, 24, 24), mat(XZ.skin, { roughness: 0.5 }), [0, -0.2, 0.05], null, [0.85, 0.55, 0.75])
  // 耳
  add(head, new THREE.SphereGeometry(0.06, 16, 16), mat(XZ.skin, { roughness: 0.52 }), [-0.33, -0.02, -0.02], null, [0.7, 1.1, 0.85])
  add(head, new THREE.SphereGeometry(0.06, 16, 16), mat(XZ.skin, { roughness: 0.52 }), [0.33, -0.02, -0.02], null, [0.7, 1.1, 0.85])

  // —— 发：盔必须盖住头顶（禁地中海）+ 刘海 + 侧发 + 低马尾 ——
  const hairMat = mat(XZ.hair, { roughness: 0.88 })
  const hairHi = mat(XZ.hairHi, { roughness: 0.82 })
  // 主盔：上移放大，盖住颅顶
  add(head, new THREE.SphereGeometry(0.34, 40, 40), hairMat, [0, 0.1, -0.04], null, [1.1, 0.95, 1.12])
  // 颅顶盖帽
  add(head, new THREE.SphereGeometry(0.22, 24, 24), hairMat, [0, 0.28, -0.02], null, [1.15, 0.55, 1.05])
  // 后脑
  add(head, new THREE.SphereGeometry(0.22, 22, 22), hairMat, [0, 0.02, -0.3], null, [0.95, 0.9, 0.7])
  // 齐刘海：多片 + 额前横压
  add(head, new THREE.BoxGeometry(0.42, 0.11, 0.1), hairHi, [-0.02, 0.16, 0.3], [1.05, 0.05, 0])
  const bangs = [
    [-0.16, 0.12, 0.3, 0.13, 0.11, 0.08, 0.9, 0.1],
    [-0.04, 0.13, 0.31, 0.12, 0.1, 0.08, 0.95, 0],
    [0.08, 0.125, 0.3, 0.11, 0.1, 0.075, 0.92, -0.12],
    [0.18, 0.12, 0.27, 0.09, 0.09, 0.07, 0.88, -0.25],
  ]
  for (const b of bangs) {
    add(head, new THREE.BoxGeometry(b[3], b[4], b[5]), hairHi, [b[0], b[1], b[2]], [b[6], b[7], 0])
  }
  // 侧发下延贴颊
  add(head, new THREE.SphereGeometry(0.17, 18, 18), hairMat, [-0.29, -0.08, 0.02], null, [0.48, 1.25, 0.58])
  add(head, new THREE.SphereGeometry(0.17, 18, 18), hairMat, [0.29, -0.08, 0.02], null, [0.48, 1.25, 0.58])
  // 低马尾
  add(head, new THREE.CapsuleGeometry(0.068, 0.22, 6, 12), hairMat, [0.04, -0.18, -0.32], [0.85, 0, 0.1])
  add(head, new THREE.SphereGeometry(0.09, 14, 14), hairMat, [0.05, -0.36, -0.38])

  const eyeL = makeEye(-0.105)
  const eyeR = makeEye(0.105)
  head.add(eyeL, eyeR)

  // 鼻
  add(head, new THREE.SphereGeometry(0.028, 12, 12), mat('#E0B89A', { roughness: 0.48 }), [0, -0.02, 0.325], null, [0.55, 0.75, 0.55])
  // 微笑
  add(head, new THREE.TorusGeometry(0.045, 0.009, 8, 20, Math.PI), mat(XZ.lip, { roughness: 0.42 }), [0, -0.125, 0.31], [Math.PI, 0, 0])
  // 轻颊
  add(head, new THREE.SphereGeometry(0.04, 10, 10), mat(XZ.cheek, { roughness: 0.6, opacity: 0.28 }), [-0.19, -0.05, 0.26], null, [1, 0.7, 0.4])
  add(head, new THREE.SphereGeometry(0.04, 10, 10), mat(XZ.cheek, { roughness: 0.6, opacity: 0.28 }), [0.19, -0.05, 0.26], null, [1, 0.7, 0.4])

  // 颈
  add(root, new THREE.CylinderGeometry(0.08, 0.1, 0.13, 20), mat(XZ.skin, { roughness: 0.5 }), [0, 0.04, 0.02])

  // —— 上身 ——
  const torso = new THREE.Group()
  torso.position.set(0, -0.3, 0)
  root.add(torso)

  // 西装躯干（略宽肩）
  add(torso, new THREE.CapsuleGeometry(0.27, 0.3, 8, 20), mat(XZ.suit, { roughness: 0.62, metalness: 0.04 }), [0, 0.02, 0])
  add(torso, new THREE.CapsuleGeometry(0.09, 0.06, 4, 12), mat(XZ.suitDark, { roughness: 0.62 }), [-0.24, 0.2, 0], [0, 0, 0.4])
  add(torso, new THREE.CapsuleGeometry(0.09, 0.06, 4, 12), mat(XZ.suitDark, { roughness: 0.62 }), [0.24, 0.2, 0], [0, 0, -0.4])

  // 衬衫领 V
  add(torso, new THREE.BoxGeometry(0.14, 0.12, 0.06), mat(XZ.shirt, { roughness: 0.5 }), [0, 0.22, 0.12])
  // 左/右驳领
  add(torso, new THREE.BoxGeometry(0.09, 0.14, 0.03), mat(XZ.suitDark, { roughness: 0.58 }), [-0.08, 0.18, 0.2], [0.15, 0.35, 0.25])
  add(torso, new THREE.BoxGeometry(0.09, 0.14, 0.03), mat(XZ.suitDark, { roughness: 0.58 }), [0.08, 0.18, 0.2], [0.15, -0.35, -0.25])

  // 品牌丝巾（左领，双层折面）
  add(
    torso,
    new THREE.BoxGeometry(0.1, 0.16, 0.028),
    mat(XZ.brand, { roughness: 0.32, metalness: 0.08, emissive: XZ.brand, emissiveIntensity: 0.06 }),
    [-0.1, 0.2, 0.24],
    [0.25, 0.4, 0.7],
  )
  add(
    torso,
    new THREE.BoxGeometry(0.07, 0.1, 0.022),
    mat(XZ.brandDark, { roughness: 0.35, metalness: 0.08 }),
    [-0.08, 0.12, 0.26],
    [0.4, 0.2, 0.5],
  )

  // 挂绳
  add(
    torso,
    new THREE.TorusGeometry(0.095, 0.012, 8, 24, Math.PI * 1.05),
    mat(XZ.brand, { roughness: 0.4, metalness: 0.1 }),
    [0.02, 0.16, 0.26],
    [0.25, 0, 0.06],
  )
  // 工牌
  add(torso, new THREE.BoxGeometry(0.12, 0.085, 0.014), mat(XZ.badge, { roughness: 0.35 }), [0.04, 0.02, 0.3], [-0.1, 0.04, 0.06])
  add(torso, new THREE.BoxGeometry(0.095, 0.014, 0.005), mat(XZ.brand, { roughness: 0.3 }), [0.04, 0.035, 0.31])
  add(torso, new THREE.BoxGeometry(0.07, 0.008, 0.004), mat('#94A3B8', { roughness: 0.4 }), [0.04, 0.01, 0.31])

  // 臂
  const leftArm = new THREE.Group()
  leftArm.position.set(-0.4, -0.12, 0)
  root.add(leftArm)
  add(leftArm, new THREE.CapsuleGeometry(0.058, 0.2, 6, 12), mat(XZ.suit, { roughness: 0.6 }), [0, -0.14, 0])
  add(leftArm, new THREE.SphereGeometry(0.052, 14, 14), mat(XZ.skin, { roughness: 0.5 }), [0, -0.3, 0])

  const rightArm = new THREE.Group()
  rightArm.position.set(0.4, -0.12, 0)
  root.add(rightArm)
  add(rightArm, new THREE.CapsuleGeometry(0.058, 0.2, 6, 12), mat(XZ.suit, { roughness: 0.6 }), [0, -0.14, 0])
  add(rightArm, new THREE.SphereGeometry(0.052, 14, 14), mat(XZ.skin, { roughness: 0.5 }), [0, -0.3, 0])

  root.position.set(0, -0.18, 0)
  root.scale.setScalar(1.0)

  return { root, head, torso, leftArm, rightArm, eyes: [eyeL, eyeR] }
}

/**
 * @param {ReturnType<typeof createXiaoZhiA>} fig
 * @param {string} presence
 * @param {number} t
 */
export function updateXiaoZhiA(fig, presence, t) {
  const { root, head, torso, leftArm, rightArm, eyes } = fig
  root.position.y = -0.18 + Math.sin(t * 1.45) * 0.01
  torso.scale.y = 1 + Math.sin(t * 1.45) * 0.01

  if (presence === 'thinking') {
    head.rotation.z = Math.sin(t * 2.0) * 0.06
    head.rotation.x = -0.05 + Math.sin(t * 1.3) * 0.02
    rightArm.rotation.set(0.12, 0, -0.35)
  } else if (presence === 'waiting') {
    head.rotation.x = 0.03 + Math.sin(t * 2.4) * 0.07
    head.rotation.z = Math.sin(t * 0.85) * 0.02
    rightArm.rotation.set(0.45, 0, -1.0 - Math.sin(t * 2.2) * 0.08)
  } else {
    head.rotation.x = Math.sin(t * 1.0) * 0.028
    head.rotation.z = Math.sin(t * 0.65) * 0.02
    rightArm.rotation.set(0.08, 0, -0.28)
  }
  leftArm.rotation.set(0.08, 0, 0.28)

  for (const eye of eyes) {
    const blink = Math.pow(Math.max(0, Math.sin(t * 2.35 + eye.userData.x * 5) - 0.945) / 0.055, 2)
    eye.userData.open.scale.y = 1 - blink * 0.88
    const browY = presence === 'thinking' ? 0.12 : 0.112
    const browZ =
      presence === 'thinking' ? (eye.userData.x < 0 ? 0.26 : -0.26) : eye.userData.x < 0 ? 0.08 : -0.08
    eye.userData.brow.position.y = browY
    eye.userData.brow.rotation.z = browZ
  }
}
