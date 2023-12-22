const Watermark = ({ chartWidth, chartHeight }) => {
  return (
    <>
      <text
        x={chartWidth / 2}
        y={chartHeight - 57}
        textAnchor='middle'
        style={{
          fill: '#f0f6fc',
          fontSize: '1.6rem',
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
