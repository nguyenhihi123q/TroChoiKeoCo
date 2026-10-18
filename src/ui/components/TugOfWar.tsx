// Hoạt cảnh kéo co bằng SVG: mỗi bên 3 học sinh đeo khăn quàng (màu theo đội),
// áo trắng đồng phục, choãi chân ngả người kéo dây. Nút thắt (bow) dịch theo
// `fraction` trong [-1, 1]: âm nghiêng về Xanh (trái), dương nghiêng về Đỏ (phải).
// Tôn trọng prefers-reduced-motion qua CSS transition (khai báo ở index.css).
interface Props {
  fraction: number; // -1..1
  blueName: string;
  redName: string;
}

// Tông da & tóc hơi khác nhau để 3 bạn trông như những người khác nhau.
const SKINS = ['#f4c6a0', '#e6ad86', '#f0bd94'];
const HAIRS = ['#2b2320', '#3d2b1f', '#1c1c1c'];

interface PullerProps {
  x: number;
  face: 1 | -1; // 1 = quay/kéo sang phải (đội Xanh), -1 = sang trái (đội Đỏ)
  scarf: string; // màu khăn quàng theo đội
  shorts: string; // màu quần theo đội
  skin: string;
  hair: string;
  delay: number; // lệch pha hoạt cảnh gồng kéo (giây)
}

// Hình vẽ gốc quay sang phải, ngả người về sau (trái), tay nắm dây ở (18,69).
// Đội bên phải dùng scale(-1,1) để lật gương. Nhóm trong `.puller` gồng nhịp
// nhàng (CSS) để trông như đang dùng sức kéo; lệch pha nhau cho tự nhiên.
function Puller({ x, face, scarf, shorts, skin, hair, delay }: PullerProps) {
  return (
    <g transform={`translate(${x}, 0) scale(${face}, 1)`}>
      <g className="puller" style={{ animationDelay: `${delay}s` }}>
      {/* Chân choãi: chân sau chống, chân trước đạp về phía dây */}
      <line x1={0} y1={90} x2={-15} y2={120} stroke={shorts} strokeWidth={7} strokeLinecap="round" />
      <line x1={0} y1={90} x2={12} y2={118} stroke={shorts} strokeWidth={7} strokeLinecap="round" />
      {/* Giày */}
      <line x1={-15} y1={120} x2={-22} y2={120} stroke="#334155" strokeWidth={5} strokeLinecap="round" />
      <line x1={12} y1={118} x2={19} y2={118} stroke="#334155" strokeWidth={5} strokeLinecap="round" />
      {/* Quần */}
      <rect x={-6} y={82} width={13} height={12} rx={3} fill={shorts} />
      {/* Áo trắng (thân ngả về sau) */}
      <line x1={0} y1={86} x2={-7} y2={58} stroke="#f8fafc" strokeWidth={14} strokeLinecap="round" />
      <line x1={0} y1={86} x2={-7} y2={58} stroke="#dbe4ef" strokeWidth={14} strokeLinecap="round" opacity={0.25} />
      {/* Tay: vai -> khuỷu -> nắm dây */}
      <polyline
        points="-7,60 6,62 18,69"
        fill="none"
        stroke={skin}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={18} cy={69} r={3.4} fill={skin} />
      {/* Khăn quàng: tam giác trước ngực + đuôi bay về sau + nút thắt */}
      <path d={`M -14,57 L -2,57 L -8,69 Z`} fill={scarf} />
      <path d={`M -8,66 L -14,80 L -5,70 Z`} fill={scarf} opacity={0.85} />
      <circle cx={-8} cy={58} r={2.6} fill={scarf} stroke="#ffffff" strokeWidth={0.8} />
      {/* Cổ */}
      <line x1={-9} y1={55} x2={-9} y2={50} stroke={skin} strokeWidth={5} strokeLinecap="round" />
      {/* Đầu */}
      <circle cx={-12} cy={46} r={8} fill={skin} />
      {/* Tóc (kiểu úp nồi) */}
      <path d={`M -20,46 a 8 8 0 0 1 16 0 q -8 -3 -16 0 Z`} fill={hair} />
      {/* Mắt hướng về phía dây */}
      <circle cx={-8} cy={47} r={1} fill="#1f2937" />
      <circle cx={-11.5} cy={47} r={1} fill="#1f2937" />
      </g>
    </g>
  );
}

export function TugOfWar({ fraction, blueName, redName }: Props) {
  const shift = Math.max(-1, Math.min(1, fraction)) * 60; // px dịch nút thắt
  // Đội thua trượt xa hơn nút thắt để lực kéo nhìn thấy rõ ở mỗi điểm.
  const blueDragged = Math.max(0, shift * 2);
  const redDragged = Math.min(0, shift * 2);
  const leadingTeam = fraction < 0 ? blueName : fraction > 0 ? redName : null;
  const skins = SKINS;
  const hairs = HAIRS;
  return (
    <div className="tug">
      <div className={`tug-status ${fraction < 0 ? 'blue' : fraction > 0 ? 'red' : ''}`} aria-live="polite">
        {leadingTeam ? `💪 ${leadingTeam} đang kéo!` : '🤝 Đang giằng co'}
      </div>
      <svg
        viewBox="0 0 400 150"
        role="img"
        aria-label={`Dây đang nghiêng về ${fraction > 0 ? redName : fraction < 0 ? blueName : 'giữa'}`}
      >
        {/* Nền đất */}
        <line x1={0} y1={122} x2={400} y2={122} stroke="rgba(226,232,240,0.35)" strokeWidth={3} />
        <line x1={200} y1={108} x2={200} y2={136} stroke="rgba(250,204,21,0.6)" strokeWidth={2} strokeDasharray="4 3" />

        {/* Dây thừng + nút thắt: dịch theo fraction */}
        <g style={{ transition: 'transform 0.35s ease' }} transform={`translate(${shift}, 0)`}>
          <line x1={20} y1={70} x2={380} y2={70} stroke="#b9822f" strokeWidth={7} strokeLinecap="round" />
          <line x1={20} y1={68} x2={380} y2={68} stroke="#e0a94e" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
          {/* Cờ nút thắt ở tâm (nhấp nhô nhẹ cho sống động) */}
          <g className="knot">
            <line x1={200} y1={70} x2={200} y2={50} stroke="#a16207" strokeWidth={2} />
            <path d="M 200,50 L 216,55 L 200,60 Z" fill="var(--gold, #facc15)" stroke="#fff" strokeWidth={1} />
            <circle cx={200} cy={70} r={6} fill="var(--gold, #facc15)" stroke="#fff" strokeWidth={2} />
          </g>
        </g>

        {/* Khi đội Đỏ dẫn, đội Xanh bị kéo sang phải theo dây. */}
        <g className="pulling-team" style={{ transform: `translate(${blueDragged}px, 0)` }}>
          <Puller x={34} face={1} scarf="#2563eb" shorts="#1e3a8a" skin={skins[0]} hair={hairs[0]} delay={0} />
          <Puller x={66} face={1} scarf="#3b82f6" shorts="#1e40af" skin={skins[1]} hair={hairs[1]} delay={0.1} />
          <Puller x={98} face={1} scarf="#2563eb" shorts="#1d4ed8" skin={skins[2]} hair={hairs[2]} delay={0.2} />
        </g>

        {/* Khi đội Xanh dẫn, đội Đỏ bị kéo sang trái theo dây. */}
        <g className="pulling-team" style={{ transform: `translate(${redDragged}px, 0)` }}>
          <Puller x={366} face={-1} scarf="#dc2626" shorts="#7f1d1d" skin={skins[0]} hair={hairs[1]} delay={0.42} />
          <Puller x={334} face={-1} scarf="#ef4444" shorts="#991b1b" skin={skins[1]} hair={hairs[2]} delay={0.52} />
          <Puller x={302} face={-1} scarf="#dc2626" shorts="#b91c1c" skin={skins[2]} hair={hairs[0]} delay={0.32} />
        </g>
      </svg>
    </div>
  );
}
