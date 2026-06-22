import { css } from '../css.js'

export default function ElementsCard({ v }) {
  return (
    <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:12px; padding:18px;')}>
      <div style={css('display:flex; align-items:baseline; justify-content:space-between; margin-bottom:4px;')}>
        <div style={css('font-family:\'DM Serif Display\',serif; font-size:18px; color:#27408a;')}>元素</div>
        <div style={css('font-size:12px; color:#9a8a6b;')}>拖曳 ⠿ 調整優先順序(上＝優先)</div>
      </div>

      <div style={css('display:grid; grid-template-columns:16px 28px 30px 1fr 44px 38px 16px; gap:6px; align-items:center; padding:8px 2px 6px; font-size:11px; font-weight:700; color:#a8997a; letter-spacing:0.3px;')}>
        <div></div><div>色</div><div>圖</div><div>名稱</div><div style={css('text-align:center;')}>數量</div><div style={css('text-align:center;')}>變化</div><div></div>
      </div>

      <div style={css('display:flex; flex-direction:column; gap:6px;')}>
        {v.elementsView.map((el, i) => (
          <div key={i} draggable onDragStart={el.onDragStart} onDragOver={el.onDragOver} onDrop={el.onDrop} style={css('display:grid; grid-template-columns:16px 28px 30px 1fr 44px 38px 16px; gap:6px; align-items:center; background:#fff; border:1.5px solid #e6d8ba; border-radius:8px; padding:6px 8px;')}>
            <div style={css('cursor:grab; color:#c4b48f; font-size:15px; text-align:center; line-height:1; user-select:none;')}>⠿</div>
            <input type="color" value={el.color} onChange={el.onColor} style={css('width:28px; height:30px;')} />
            <label style={css('position:relative; width:30px; height:30px; border-radius:6px; cursor:pointer; overflow:hidden; border:1px solid #e6d8ba; display:flex; align-items:center; justify-content:center; background:#f4ecdb;')}>
              <input type="file" accept="image/*" onChange={el.onImg} style={css('position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer;')} />
              {el.hasImg && el.imgEl}
              {el.noImg && (<span style={css('font-size:15px; color:#b3a07c; font-weight:700; pointer-events:none;')}>＋</span>)}
            </label>
            <input type="text" value={el.name} onChange={el.onName} style={css('width:100%; height:32px; border:1px solid #e6d8ba; border-radius:6px; padding:0 8px; font-family:\'Karla\',sans-serif; font-size:15px; font-weight:700; color:#34291b;')} />
            <input type="number" value={el.quantity} onChange={el.onQty} style={css('width:100%; height:32px; text-align:center; border:1px solid #e6d8ba; border-radius:6px; font-family:\'Karla\',sans-serif; font-size:14px; font-weight:600; color:#34291b;')} />
            <input type="number" value={el.variations} onChange={el.onVar} style={css('width:100%; height:32px; text-align:center; border:1px solid #e6d8ba; border-radius:6px; font-family:\'Karla\',sans-serif; font-size:14px; font-weight:600; color:#34291b;')} />
            <div onClick={el.onRemove} style={css('cursor:pointer; color:#cbb48f; font-size:17px; text-align:center; line-height:1;')}>×</div>
          </div>
        ))}
      </div>

      <button onClick={v.addEl} style={css('width:100%; margin-top:12px; border:1.5px dashed #cbb98f; background:transparent; color:#8a7a5b; font-family:\'Karla\',sans-serif; font-weight:700; font-size:14px; padding:10px; border-radius:8px; cursor:pointer;')}>＋ 新增元素</button>
    </div>
  )
}
