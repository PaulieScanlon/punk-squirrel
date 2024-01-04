const EventLegend = ({ id, title, color, x, y, anchor }) => {
  return (
    <g>
      <text
        x={x}
        y={y}
        textAnchor={anchor}
        style={{
          fill: color,
          fontSize: '1.8rem',
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 700,
        }}
      >
        {title}
      </text>
      <text
        id={id}
        x={x}
        y={y + 70}
        textAnchor={anchor}
        style={{
          fill: '#f0f6fc',
          fontSize: '4rem',
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 700,
        }}
      >
        0
      </text>
    </g>
  );
};

export default EventLegend;
