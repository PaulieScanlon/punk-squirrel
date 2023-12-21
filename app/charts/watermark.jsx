const Watermark = ({ chartWidth, chartHeight }) => {
  return (
    <>
      <text
        x={chartWidth / 2}
        y={chartHeight - 55}
        textAnchor='middle'
        style={{
          fill: '#f0f6fc',
          fontSize: '1.4rem',
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 600,
        }}
      >
        www.punksquirrel.app
      </text>
    </>
  );
};

export default Watermark;
