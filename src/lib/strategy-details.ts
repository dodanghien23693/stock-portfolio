// Chi tiết thông tin cho tất cả các strategies
export const STRATEGY_DETAILS = {
  smaStrategy: {
    key: "smaStrategy",
    name: "Chiến lược SMA Crossover",
    description:
      "Chiến lược cắt đường trung bình động đơn giản để bắt xu hướng thị trường",
    category: "Cơ bản",
    parameters: {
      shortPeriod: 10,
      longPeriod: 30,
      riskPercentage: 0.1,
      stopLossPercentage: 0.05,
      takeProfitPercentage: 0.15,
    },
    methodology: `
      <h3>Nguyên lý hoạt động:</h3>
      <p>Chiến lược SMA Crossover dựa trên việc so sánh hai đường trung bình động với chu kỳ khác nhau:</p>
      <ul>
        <li><strong>SMA ngắn hạn (10 ngày):</strong> Phản ánh xu hướng gần đây của giá</li>
        <li><strong>SMA dài hạn (30 ngày):</strong> Thể hiện xu hướng tổng thể của thị trường</li>
      </ul>
      
      <h3>Tín hiệu giao dịch:</h3>
      <ul>
        <li><strong>Tín hiệu MUA:</strong> Khi SMA ngắn hạn cắt lên trên SMA dài hạn (Golden Cross)</li>
        <li><strong>Tín hiệu BÁN:</strong> Khi SMA ngắn hạn cắt xuống dưới SMA dài hạn (Death Cross)</li>
      </ul>
      
      <h3>Quản lý rủi ro:</h3>
      <ul>
        <li>Stop-loss: 5% từ giá mua</li>
        <li>Take-profit: 15% từ giá mua</li>
        <li>Phân bổ vốn: 10% cho mỗi giao dịch</li>
      </ul>
    `,
    examples: [
      `
        <h4>Ví dụ 1: Cổ phiếu VNM (Vinamilk)</h4>
        <p><strong>Ngày 15/03/2024:</strong></p>
        <ul>
          <li>SMA 10 ngày: 85,500 VND</li>
          <li>SMA 30 ngày: 84,800 VND</li>
          <li>Giá hiện tại: 85,200 VND</li>
        </ul>
        <p><strong>Phân tích:</strong> SMA 10 vừa cắt lên trên SMA 30, tạo tín hiệu Golden Cross. 
        Khuyến nghị mua với stop-loss tại 81,000 VND và take-profit tại 98,000 VND.</p>
      `,
      `
        <h4>Ví dụ 2: Cổ phiếu VIC (Vingroup)</h4>
        <p><strong>Ngày 20/05/2024:</strong></p>
        <ul>
          <li>SMA 10 ngày: 42,300 VND</li>
          <li>SMA 30 ngày: 43,100 VND</li>
          <li>Giá hiện tại: 42,100 VND</li>
        </ul>
        <p><strong>Phân tích:</strong> SMA 10 đang dưới SMA 30 và có xu hướng giảm tiếp. 
        Không khuyến nghị mua trong giai đoạn này.</p>
      `,
    ],
    strengths: [
      "Đơn giản, dễ hiểu và dễ thực hiện",
      "Hiệu quả trong thị trường có xu hướng rõ ràng",
      "Giảm nhiễu của biến động ngắn hạn",
      "Phù hợp với nhà đầu tư mới bắt đầu",
      "Có thể áp dụng cho nhiều loại tài sản",
      "Tự động hóa được hoàn toàn",
    ],
    weaknesses: [
      "Kém hiệu quả trong thị trường sideways (đi ngang)",
      "Tín hiệu muộn, có thể bỏ lỡ phần lớn xu hướng",
      "Nhiều tín hiệu sai trong thời kỳ biến động cao",
      "Không xem xét yếu tố cơ bản của doanh nghiệp",
      "Phụ thuộc vào tham số chu kỳ được chọn",
      "Có thể tạo ra nhiều giao dịch không cần thiết",
    ],
    conditions: [
      "Thị trường có xu hướng tăng hoặc giảm rõ ràng",
      "Khối lượng giao dịch ổn định",
      "Ít tin tức đột biến tác động đến thị trường",
      "Cổ phiếu có tính thanh khoản tốt",
      "Chu kỳ thị trường dài hạn (3-6 tháng trở lên)",
      "Nhà đầu tư có thời gian theo dõi thường xuyên",
    ],
    risks: [
      "⚠️ CẢNH BÁO: Chiến lược này có thể gây thua lỗ trong thị trường biến động mạnh",
      "💰 RỦI RO VỐN: Có thể mất toàn bộ số vốn đầu tư nếu không quản lý rủi ro tốt",
      "📉 RỦI RO TÂM LÝ: Nhà đầu tư có thể hoảng sợ và đóng lệnh sớm khi thấy thua lỗ",
      "⏰ RỦI RO THỜI GIAN: Tín hiệu muộn có thể khiến bỏ lỡ cơ hội tốt",
      "🎯 RỦI RO SAI SÓT: Tín hiệu sai có thể dẫn đến giao dịch thua lỗ liên tiếp",
      "📊 KHUYẾN CÁO: Nên kết hợp với các chỉ báo khác để tăng độ chính xác",
    ],
    references: [
      `<strong>Sách tham khảo:</strong> "Technical Analysis of the Financial Markets" by John J. Murphy - Chương 4: Moving Averages`,
      `<strong>Nghiên cứu:</strong> <a href="https://www.investopedia.com/articles/active-trading/052014/how-use-moving-average-buy-stocks.asp" target="_blank">Investopedia - How to Use Moving Average to Buy Stocks</a>`,
      `<strong>Bài viết:</strong> "Moving Average Crossover Strategy" - TradingView Education`,
      `<strong>Video hướng dẫn:</strong> "SMA Strategy Explained" - YouTube Financial Education`,
      `<strong>Nghiên cứu thực nghiệm:</strong> "Performance of Moving Average Trading Rules" - Journal of Financial Economics`,
      `<strong>Blog chuyên môn:</strong> <a href="https://www.babypips.com/learn/forex/moving-average-crossover" target="_blank">BabyPips - Moving Average Crossover</a>`,
    ],
  },

  buyAndHold: {
    key: "buyAndHold",
    name: "Chiến lược Mua và Nắm giữ",
    description:
      "Chiến lược đầu tư dài hạn, mua và nắm giữ cổ phiếu trong thời gian dài",
    category: "Cơ bản",
    parameters: {
      holdingPeriod: 365,
      maxPositions: 10,
      rebalanceFrequency: "quarterly",
    },
    methodology: `
      <h3>Nguyên lý hoạt động:</h3>
      <p>Chiến lược Buy and Hold dựa trên niềm tin rằng thị trường chứng khoán sẽ tăng trưởng theo thời gian:</p>
      <ul>
        <li><strong>Mua một lần:</strong> Chọn cổ phiếu chất lượng và mua với số lượng lớn</li>
        <li><strong>Nắm giữ dài hạn:</strong> Không bán trong thời gian ngắn, bất kể biến động thị trường</li>
        <li><strong>Tái cân bằng định kỳ:</strong> Điều chỉnh danh mục theo tần suất đã định</li>
      </ul>
      
      <h3>Lựa chọn cổ phiếu:</h3>
      <ul>
        <li>Công ty có nền tảng tài chính vững mạnh</li>
        <li>Doanh nghiệp dẫn đầu trong ngành</li>
        <li>Có lịch sử tăng trưởng ổn định</li>
        <li>Triển vọng phát triển tốt trong tương lai</li>
      </ul>
    `,
    examples: [
      `
        <h4>Ví dụ 1: Đầu tư vào nhóm VN30</h4>
        <p><strong>Thời điểm đầu tư:</strong> 01/01/2020</p>
        <ul>
          <li>VNM: 50 triệu VND</li>
          <li>VIC: 50 triệu VND</li>
          <li>VCB: 50 triệu VND</li>
          <li>Tổng vốn đầu tư: 150 triệu VND</li>
        </ul>
        <p><strong>Kết quả sau 4 năm (2024):</strong> Danh mục tăng trưởng 8-12%/năm, 
        tổng giá trị khoảng 220-240 triệu VND.</p>
      `,
      `
        <h4>Ví dụ 2: Đầu tư ETF VN30</h4>
        <p><strong>Chiến lược:</strong> Đầu tư định kỳ 5 triệu VND/tháng vào ETF E1VFVN30</p>
        <p><strong>Lợi ích:</strong> Phân tán rủi ro, chi phí thấp, không cần chọn cổ phiếu cụ thể</p>
      `,
    ],
    strengths: [
      "Không cần theo dõi thị trường thường xuyên",
      "Chi phí giao dịch thấp",
      "Tận dụng được sức mạnh của lãi kép",
      "Phù hợp với nhà đầu tư bận rộn",
      "Giảm stress tâm lý từ biến động ngắn hạn",
      "Hiệu quả trong dài hạn cho thị trường tăng trưởng",
    ],
    weaknesses: [
      "Không linh hoạt trong thị trường bear",
      "Có thể chịu thua lỗ lớn trong khủng hoảng",
      "Bỏ lỡ cơ hội short-term trading",
      "Yêu cầu kiên nhẫn và kỷ luật cao",
      "Phụ thuộc vào tăng trưởng kinh tế dài hạn",
      "Rủi ro tập trung nếu không đa dạng hóa",
    ],
    conditions: [
      "Thị trường có xu hướng tăng trưởng dài hạn",
      "Kinh tế vĩ mô ổn định",
      "Nhà đầu tư có khả năng tài chính ổn định",
      "Không cần thanh khoản trong ngắn hạn",
      "Có thời gian đầu tư ít nhất 5-10 năm",
      "Tâm lý bền bỉ, không bị ảnh hưởng bởi biến động",
    ],
    risks: [
      "⚠️ RỦI RO THỜI GIAN: Có thể mất nhiều năm để phục hồi sau khủng hoảng",
      "💰 RỦI RO THANH KHOẢN: Khó bán nhanh khi cần vốn gấp",
      "📉 RỦI RO THỊ TRƯỜNG: Toàn bộ danh mục giảm trong bear market",
      "🏢 RỦI RO DOANH NGHIỆP: Công ty có thể phá sản hoặc sa sút",
      "💱 RỦI RO LẠM PHÁT: Lợi nhuận có thể không theo kịp lạm phát",
      "🎯 KHUYẾN CÁO: Chỉ đầu tư số tiền có thể để yên trong 5-10 năm",
    ],
    references: [
      `<strong>Sách kinh điển:</strong> "The Intelligent Investor" by Benjamin Graham`,
      `<strong>Nghiên cứu:</strong> "A Random Walk Down Wall Street" by Burton Malkiel`,
      `<strong>Bài viết:</strong> <a href="https://www.bogleheads.org/wiki/Buy_and_hold" target="_blank">Bogleheads - Buy and Hold Strategy</a>`,
      `<strong>Nghiên cứu thực nghiệm:</strong> "Long-term Returns on Stock Investments" - Vanguard Research`,
      `<strong>Blog đầu tư:</strong> "The Simple Path to Wealth" by JL Collins`,
      `<strong>Dữ liệu lịch sử:</strong> S&P 500 Long-term Performance Analysis - Yahoo Finance`,
    ],
  },

  rsiStrategy: {
    key: "rsiStrategy",
    name: "Chiến lược RSI",
    description:
      "Chiến lược dựa trên chỉ báo RSI để xác định vùng quá mua và quá bán",
    category: "Động lượng",
    parameters: {
      rsiPeriod: 14,
      overboughtLevel: 70,
      oversoldLevel: 30,
      riskPercentage: 0.08,
    },
    methodology: `
      <h3>Chỉ báo RSI (Relative Strength Index):</h3>
      <p>RSI là một chỉ báo momentum dao động từ 0 đến 100, đo lường tốc độ và biên độ thay đổi giá:</p>
      <ul>
        <li><strong>RSI > 70:</strong> Vùng quá mua (Overbought) - Tín hiệu bán</li>
        <li><strong>RSI < 30:</strong> Vùng quá bán (Oversold) - Tín hiệu mua</li>
        <li><strong>RSI 30-70:</strong> Vùng trung tính</li>
      </ul>
      
      <h3>Công thức tính RSI:</h3>
      <p>RSI = 100 - (100 / (1 + RS))</p>
      <p>Trong đó: RS = Trung bình tăng / Trung bình giảm (trong n ngày)</p>
      
      <h3>Tín hiệu giao dịch:</h3>
      <ul>
        <li><strong>Mua:</strong> RSI từ dưới 30 quay lên trên 30</li>
        <li><strong>Bán:</strong> RSI từ trên 70 quay xuống dưới 70</li>
        <li><strong>Xác nhận:</strong> Kết hợp với xu hướng giá</li>
      </ul>
    `,
    examples: [
      `
        <h4>Ví dụ 1: Mua vùng oversold - VNM</h4>
        <p><strong>Ngày 10/04/2024:</strong></p>
        <ul>
          <li>RSI 14: 28 (vùng quá bán)</li>
          <li>Giá: 84,000 VND</li>
          <li>Hành động: Mua khi RSI vượt 30</li>
        </ul>
        <p><strong>Kết quả:</strong> Giá tăng lên 88,500 VND trong 10 ngày (+5.4%)</p>
      `,
      `
        <h4>Ví dụ 2: Bán vùng overbought - TCB</h4>
        <p><strong>Ngày 25/06/2024:</strong></p>
        <ul>
          <li>RSI 14: 75 (vùng quá mua)</li>
          <li>Giá: 31,200 VND</li>
          <li>Hành động: Bán khi RSI giảm xuống dưới 70</li>
        </ul>
        <p><strong>Kết quả:</strong> Tránh được đợt giảm 3.8% trong tuần sau</p>
      `,
    ],
    strengths: [
      "Hiệu quả trong thị trường sideways",
      "Tín hiệu rõ ràng và dễ nhận biết",
      "Giúp xác định điểm vào/ra tốt",
      "Có thể áp dụng cho mọi khung thời gian",
      "Kết hợp tốt với các chỉ báo khác",
      "Phản ánh tâm lý thị trường",
    ],
    weaknesses: [
      "Tín hiệu sai nhiều trong thị trường trending mạnh",
      "RSI có thể ở vùng cực trị trong thời gian dài",
      "Không dự đoán được hướng đi tương lai",
      "Phụ thuộc vào tham số chu kỳ",
      "Cần kết hợp với phân tích khác",
      "Lag indicator (chỉ báo trễ)",
    ],
    conditions: [
      "Thị trường đi ngang hoặc có xu hướng yếu",
      "Cổ phiếu có biến động vừa phải",
      "Khối lượng giao dịch ổn định",
      "Không có tin tức đột biến",
      "Thị trường không quá volatile",
      "Chu kỳ giao dịch ngắn đến trung hạn",
    ],
    risks: [
      "⚠️ RỦI RO TRENDING: RSI có thể sai trong xu hướng mạnh",
      "📊 RỦI RO FALSE SIGNAL: Nhiều tín hiệu sai trong thị trường biến động",
      "⏰ RỦI RO TIMING: Có thể vào lệnh quá sớm hoặc quá muộn",
      "💰 RỦI RO OVERTRADING: Có thể giao dịch quá nhiều",
      "🎯 RỦI RO DIVERGENCE: RSI có thể diverge với giá",
      "📈 KHUYẾN CÁO: Nên kết hợp với trend analysis và volume",
    ],
    references: [
      `<strong>Tác giả gốc:</strong> J. Welles Wilder Jr. - "New Concepts in Technical Trading Systems" (1978)`,
      `<strong>Hướng dẫn chi tiết:</strong> <a href="https://www.investopedia.com/terms/r/rsi.asp" target="_blank">Investopedia - RSI Indicator</a>`,
      `<strong>Chiến lược nâng cao:</strong> "RSI Divergence Trading" - TradingView`,
      `<strong>Nghiên cứu:</strong> "RSI Effectiveness in Different Market Conditions" - Technical Analysis Journal`,
      `<strong>Video giáo dục:</strong> "Mastering RSI" - YouTube Trading Channels`,
      `<strong>Ứng dụng thực tế:</strong> "RSI in Vietnamese Stock Market" - CafeF Analysis`,
    ],
  },

  tripleMA: {
    key: "tripleMA",
    name: "Chiến lược Triple Moving Average",
    description:
      "Chiến lược sử dụng 3 đường trung bình động để xác định xu hướng và tín hiệu giao dịch",
    category: "Cơ bản",
    parameters: {
      shortPeriod: 5,
      mediumPeriod: 20,
      longPeriod: 50,
      riskPercentage: 0.1,
    },
    methodology: `
      <h3>Hệ thống Triple Moving Average:</h3>
      <p>Sử dụng 3 đường MA với chu kỳ khác nhau để tạo hệ thống giao dịch đa tầng:</p>
      <ul>
        <li><strong>MA ngắn (5):</strong> Phản ánh xu hướng ngay lập tức</li>
        <li><strong>MA trung (20):</strong> Xu hướng ngắn hạn</li>
        <li><strong>MA dài (50):</strong> Xu hướng dài hạn</li>
      </ul>
      
      <h3>Sắp xếp MA và ý nghĩa:</h3>
      <ul>
        <li><strong>Bullish Setup:</strong> MA5 > MA20 > MA50 (uptrend mạnh)</li>
        <li><strong>Bearish Setup:</strong> MA5 < MA20 < MA50 (downtrend mạnh)</li>
        <li><strong>Consolidation:</strong> MA xen kẽ nhau</li>
      </ul>
      
      <h3>Tín hiệu giao dịch:</h3>
      <ul>
        <li><strong>Strong Buy:</strong> MA5 cắt lên MA20 trong uptrend (MA20 > MA50)</li>
        <li><strong>Strong Sell:</strong> MA5 cắt xuống MA20 trong downtrend (MA20 < MA50)</li>
        <li><strong>Trend Change:</strong> MA20 cắt MA50</li>
      </ul>
    `,
    examples: [
      `
        <h4>Ví dụ 1: Perfect Bullish Setup - VIC</h4>
        <p><strong>Ngày 05/08/2024:</strong></p>
        <ul>
          <li>MA5: 44,200 VND</li>
          <li>MA20: 43,800 VND</li>
          <li>MA50: 42,500 VND</li>
          <li>Giá: 44,500 VND</li>
        </ul>
        <p><strong>Phân tích:</strong> Perfect bullish alignment, MA5 cắt lên MA20, strong uptrend confirmed. Entry tại 44,300 VND.</p>
      `,
      `
        <h4>Ví dụ 2: Trend Reversal Signal - HPG</h4>
        <p><strong>Ngày 18/09/2024:</strong></p>
        <ul>
          <li>MA20 cắt xuống MA50 (trend reversal)</li>
          <li>MA5 đã dưới MA20 từ 1 tuần trước</li>
          <li>Setup: MA5 < MA20 < MA50</li>
        </ul>
        <p><strong>Hành động:</strong> Exit all long positions, consider short positions</p>
      `,
    ],
    strengths: [
      "Xác định xu hướng rất rõ ràng",
      "Giảm thiểu false signals",
      "Phù hợp với swing trading",
      "Filter tốt cho trend strength",
      "Dễ automate và backtest",
      "Làm việc tốt trên timeframe cao",
    ],
    weaknesses: [
      "Rất lag, signals muộn",
      "Kém hiệu quả trong sideways market",
      "Miss phần lớn của trend",
      "Quá conservative, ít opportunities",
      "Whipsaw trong choppy conditions",
      "Requires strong trending markets",
    ],
    conditions: [
      "Thị trường có xu hướng mạnh và rõ ràng",
      "Timeframe từ H4 trở lên",
      "Cổ phiếu có liquidity tốt",
      "Không có excessive volatility",
      "Trend kéo dài ít nhất 2-3 tháng",
      "Macro environment ổn định",
    ],
    risks: [
      "⚠️ RỦI RO LAG: Signals rất muộn, có thể miss 30-50% của move",
      "💰 RỦI RO OPPORTUNITY COST: Ít signals, miss nhiều cơ hội",
      "📊 RỦI RO WHIPSAW: Nhiều signals sai trong ranging market",
      "🎯 RỦI RO OVERCONFIDENCE: Có thể oversize vì tự tin vào signal",
      "⏰ RỦI RO TREND END: Trend có thể end ngay sau signal",
      "📈 KHUYẾN CÁO: Chỉ dùng trong confirmed trending environments",
    ],
    references: [
      `<strong>Sách tham khảo:</strong> "Moving Averages Simplified" by Cliff Droke`,
      `<strong>Nghiên cứu:</strong> "Multiple Moving Average Systems" - Technical Analysis Journal`,
      `<strong>Hướng dẫn:</strong> <a href="https://www.tradingview.com/ideas/triplemovingaverage/" target="_blank">TradingView - Triple MA Systems</a>`,
      `<strong>Backtest results:</strong> "Triple MA Performance Analysis" - QuantConnect`,
      `<strong>Video giáo dục:</strong> "Triple Moving Average Strategy" - YouTube Trading Channels`,
      `<strong>Thực hành:</strong> "MA Systems trong HOSE" - VietStock Analysis`,
    ],
  },

  momentumContinuation: {
    key: "momentumContinuation",
    name: "Chiến lược Momentum Continuation",
    description:
      "Chiến lược dựa trên động lượng tiếp tục của xu hướng với xác nhận từ nhiều chỉ báo",
    category: "Động lượng",
    parameters: {
      momentumPeriod: 14,
      volumeMultiplier: 1.2,
      trendStrength: 0.7,
      riskPercentage: 0.15,
    },
    methodology: `
      <h3>Nguyên lý Momentum Continuation:</h3>
      <p>Dựa trên định luật Newton: "Vật đang chuyển động có xu hướng tiếp tục chuyển động"</p>
      <ul>
        <li><strong>Momentum Indicators:</strong> RSI, MACD, Rate of Change</li>
        <li><strong>Volume Confirmation:</strong> Volume tăng theo hướng trend</li>
        <li><strong>Price Action:</strong> Higher highs/lows hoặc Lower highs/lows</li>
      </ul>
      
      <h3>Điều kiện vào lệnh:</h3>
      <ul>
        <li>Trend đã được xác lập (> 20 sessions)</li>
        <li>Pullback 10-20% từ đỉnh gần nhất</li>
        <li>Momentum indicators vẫn bullish</li>
        <li>Volume support trong pullback</li>
        <li>No major resistance nearby</li>
      </ul>
      
      <h3>Entry triggers:</h3>
      <ul>
        <li>Price breaks above pullback high</li>
        <li>Volume spike confirmation</li>
        <li>Momentum indicators turn up</li>
        <li>Close above key moving average</li>
      </ul>
    `,
    examples: [
      `
        <h4>Ví dụ 1: Uptrend Continuation - VNM</h4>
        <p><strong>Tháng 07/2024:</strong></p>
        <ul>
          <li>Uptrend 2 tháng (+25%)</li>
          <li>Pullback 15% trong 1 tuần</li>
          <li>RSI từ 75 về 45</li>
          <li>Volume giảm trong pullback</li>
        </ul>
        <p><strong>Entry:</strong> Khi price break above pullback high với volume spike</p>
        <p><strong>Kết quả:</strong> Trend continuation +18% trong 3 tuần</p>
      `,
      `
        <h4>Ví dụ 2: Failed Continuation - TCB</h4>
        <p><strong>Tháng 09/2024:</strong></p>
        <ul>
          <li>Setup tương tự nhưng</li>
          <li>Volume không confirm</li>
          <li>Major resistance tại 32,000</li>
          <li>Macro news negative</li>
        </ul>
        <p><strong>Kết quả:</strong> Failed breakout, stop loss triggered</p>
      `,
    ],
    strengths: [
      "High probability setups",
      "Excellent risk/reward ratio",
      "Ride major trends effectively",
      "Clear entry/exit rules",
      "Backtestable and quantifiable",
      "Psychological edge (trend is friend)",
    ],
    weaknesses: [
      "Requires strong trending markets",
      "False signals in ranging markets",
      "Emotional challenge to buy high",
      "Trend can end anytime",
      "Requires quick decision making",
      "High drawdown potential",
    ],
    conditions: [
      "Established trend > 1 tháng",
      "High relative strength vs market",
      "No major overhead resistance",
      "Good liquidity and volume",
      "Positive sector momentum",
      "Supportive macro environment",
    ],
    risks: [
      "⚠️ RỦI RO TREND REVERSAL: Trend có thể reverse bất cứ lúc nào",
      "💰 RỦI RO BUYING HIGH: Tâm lý khó khăn khi mua ở vùng cao",
      "📊 RỦI RO FALSE CONTINUATION: Nhiều false signals trong late-stage trends",
      "🎯 RỦI RO OVERCONFIDENCE: Success có thể dẫn đến oversize",
      "⏰ RỦI RO TIMING: Entry timing rất quan trọng",
      "📈 KHUYẾN CÁO: Luôn check trend age và overall market conditions",
    ],
    references: [
      `<strong>Sách kinh điển:</strong> "New Concepts in Technical Trading" by J. Welles Wilder`,
      `<strong>Momentum theory:</strong> "Momentum Strategies" - Journal of Finance`,
      `<strong>Practical guide:</strong> <a href="https://www.investopedia.com/terms/m/momentum_investing.asp" target="_blank">Investopedia - Momentum Investing</a>`,
      `<strong>Research:</strong> "Momentum Effect in Stock Markets" - Financial Review`,
      `<strong>Vietnamese market:</strong> "Momentum trong HOSE" - SSI Research`,
      `<strong>Video education:</strong> "Momentum Trading Masterclass" - YouTube Financial Channels`,
    ],
  },

  contrarian: {
    key: "contrarian",
    name: "Chiến lược Contrarian (Nghịch xu hướng)",
    description:
      "Chiến lược đầu tư nghịch xu hướng, mua khi thị trường hoảng sợ và bán khi thị trường tham lam",
    category: "Hồi quy trung bình",
    parameters: {
      oversoldThreshold: 20,
      overboughtThreshold: 80,
      sentimentPeriod: 30,
      riskPercentage: 0.12,
    },
    methodology: `
      <h3>Triết lý Contrarian:</h3>
      <p>"Be fearful when others are greedy, be greedy when others are fearful" - Warren Buffett</p>
      <ul>
        <li><strong>Sentiment Analysis:</strong> Đo lường tâm lý thị trường</li>
        <li><strong>Oversold Conditions:</strong> Mua khi quá bán</li>
        <li><strong>Overbought Conditions:</strong> Bán khi quá mua</li>
      </ul>
      
      <h3>Chỉ báo Sentiment:</h3>
      <ul>
        <li>RSI extremes (< 20 hoặc > 80)</li>
        <li>VIX levels (fear index)</li>
        <li>Put/Call ratio</li>
        <li>News sentiment analysis</li>
        <li>Social media sentiment</li>
      </ul>
      
      <h3>Entry conditions:</h3>
      <ul>
        <li>Extreme sentiment readings</li>
        <li>Quality stocks at discount</li>
        <li>Technical oversold</li>
        <li>Value metrics attractive</li>
        <li>Fundamental strength intact</li>
      </ul>
    `,
    examples: [
      `
        <h4>Ví dụ 1: COVID-19 Bottom - VNIndex</h4>
        <p><strong>Tháng 03/2020:</strong></p>
        <ul>
          <li>VNIndex từ 1200 xuống 650 (-45%)</li>
          <li>RSI daily: 15 (extreme oversold)</li>
          <li>Fear sentiment: 95/100</li>
          <li>Quality stocks giảm 50-60%</li>
        </ul>
        <p><strong>Contrarian Action:</strong> Mua VNM, VCB, VIC khi mọi người panic sell</p>
        <p><strong>Kết quả:</strong> Portfolio phục hồi +120% trong 18 tháng</p>
      `,
      `
        <h4>Ví dụ 2: Tech Bubble Warning - 2021</h4>
        <p><strong>Q4/2021:</strong></p>
        <ul>
          <li>P/E ratio thị trường > 20</li>
          <li>RSI daily: 85 (extreme overbought)</li>
          <li>Greed index: 90/100</li>
          <li>Margin trading tăng 300%</li>
        </ul>
        <p><strong>Contrarian Action:</strong> Reduce positions, increase cash</p>
        <p><strong>Kết quả:</strong> Tránh được crash -40% năm 2022</p>
      `,
    ],
    strengths: [
      "Mua được giá tốt trong panic",
      "Tránh được các đỉnh thị trường",
      "Psychological edge khi đúng",
      "Long-term wealth building",
      "Counter-cyclical protection",
      "Value-oriented approach",
    ],
    weaknesses: [
      "Extremely difficult emotionally",
      "Can be early (lose money initially)",
      "Requires strong conviction",
      "May catch falling knife",
      "Long waiting periods",
      "Social isolation (against crowd)",
    ],
    conditions: [
      "Extreme market sentiment",
      "Quality companies at discount",
      "Strong balance sheet companies",
      "No fundamental deterioration",
      "Patient capital available",
      "Strong emotional discipline",
    ],
    risks: [
      "⚠️ RỦI RO TÂM LÝ: Rất khó thực hiện khi đối nghịch với đám đông",
      "💰 RỦI RO TIMING: Có thể sai thời điểm, thua lỗ trong ngắn hạn",
      "📊 RỦI RO VALUE TRAP: Có thể mua phải cổ phiếu có vấn đề cơ bản",
      "🎯 RỦI RO CATCHING KNIFE: Thị trường có thể giảm tiếp",
      "⏰ RỦI RO PATIENCE: Cần rất nhiều kiên nhẫn để đợi kết quả",
      "📈 KHUYẾN CÁO: Chỉ dành cho investor có tâm lý vững và hiểu biết sâu",
    ],
    references: [
      `<strong>Guru contrarian:</strong> Warren Buffett - "The Intelligent Investor"`,
      `<strong>Sentiment analysis:</strong> "Behavioral Finance" by Robert Shiller`,
      `<strong>Practical guide:</strong> <a href="https://www.investopedia.com/terms/c/contrarian.asp" target="_blank">Investopedia - Contrarian Investing</a>`,
      `<strong>Psychology:</strong> "The Art of Contrary Thinking" by Humphrey Neill`,
      `<strong>Market history:</strong> "Market Panics and Crashes" - Financial History`,
      `<strong>Vietnamese examples:</strong> "Contrarian Opportunities in Vietnam" - Dragon Capital Research`,
    ],
  },

  volatilityBreakout: {
    key: "volatilityBreakout",
    name: "Chiến lược Volatility Breakout",
    description:
      "Chiến lược giao dịch dựa trên sự bùng nổ volatility sau giai đoạn yên tĩnh",
    category: "Đột phá",
    parameters: {
      atrPeriod: 14,
      volumePeriod: 20,
      breakoutMultiplier: 2.0,
      riskPercentage: 0.18,
    },
    methodology: `
      <h3>Lý thuyết Volatility Expansion:</h3>
      <p>Sau giai đoạn consolidation (volatility thấp), thị trường có xu hướng explode với volatility cao:</p>
      <ul>
        <li><strong>Compression Phase:</strong> ATR thấp, volume giảm</li>
        <li><strong>Expansion Phase:</strong> ATR tăng đột biến, volume spike</li>
        <li><strong>Trend Phase:</strong> Direction movement mạnh</li>
      </ul>
      
      <h3>Chỉ báo chính:</h3>
      <ul>
        <li><strong>ATR (Average True Range):</strong> Đo volatility</li>
        <li><strong>Bollinger Band Width:</strong> Squeeze detection</li>
        <li><strong>Volume Ratio:</strong> Xác nhận breakout</li>
        <li><strong>Price Action:</strong> Range contraction</li>
      </ul>
      
      <h3>Setup và Entry:</h3>
      <ul>
        <li>ATR giảm 50% so với average</li>
        <li>Bollinger Bands squeeze</li>
        <li>Volume giảm dần</li>
        <li>Price tạo narrow range</li>
        <li>Entry khi breakout với volume spike</li>
      </ul>
    `,
    examples: [
      `
        <h4>Ví dụ 1: Perfect Volatility Breakout - FPT</h4>
        <p><strong>Tháng 08/2024:</strong></p>
        <ul>
          <li>3 tuần consolidation trong range 118-122k</li>
          <li>ATR giảm từ 4.2 xuống 1.8</li>
          <li>Volume giảm 40% so với average</li>
          <li>Bollinger Bands squeeze tight</li>
        </ul>
        <p><strong>Breakout:</strong> Vượt 122k với volume 300%, ATR nhảy lên 6.5</p>
        <p><strong>Kết quả:</strong> Rally đến 138k (+13%) trong 2 tuần</p>
      `,
      `
        <h4>Ví dụ 2: Failed Breakout - MSN</h4>
        <p><strong>Tháng 09/2024:</strong></p>
        <ul>
          <li>Setup tương tự: compression 2 tuần</li>
          <li>Breakout nhưng volume chỉ tăng 120%</li>
          <li>ATR không expand significant</li>
          <li>Price pull back vào range</li>
        </ul>
        <p><strong>Lesson:</strong> Volume confirmation rất quan trọng</p>
      `,
    ],
    strengths: [
      "High win rate khi setup đúng",
      "Excellent risk/reward potential",
      "Clear entry/exit signals",
      "Capture major moves effectively",
      "Quantifiable setup criteria",
      "Work across timeframes",
    ],
    weaknesses: [
      "Requires patience for setup",
      "False breakouts can occur",
      "High volatility = high risk",
      "Emotional pressure during explosive moves",
      "May gap beyond entry price",
      "Requires quick decision making",
    ],
    conditions: [
      "Clear consolidation period",
      "Low volatility environment",
      "Volume contraction phase",
      "No major news during setup",
      "Good liquidity in stock",
      "Market not in extreme stress",
    ],
    risks: [
      "⚠️ RỦI RO GAP: Có thể gap qua entry price, cause slippage",
      "💰 RỦI RO WHIPSAW: False breakouts có thể cause quick losses",
      "📊 RỦI RO VOLATILITY: High vol có nghĩa high risk",
      "🎯 RỦI RO FOMO: Có thể chase price khi breakout",
      "⏰ RỦI RO TIMING: Setup có thể kéo dài hơn expected",
      "📈 KHUYẾN CÁO: Luôn wait for volume confirmation trước khi entry",
    ],
    references: [
      `<strong>Volatility expert:</strong> "Volatility Trading" by Euan Sinclair`,
      `<strong>ATR applications:</strong> <a href="https://www.investopedia.com/terms/a/atr.asp" target="_blank">Investopedia - Average True Range</a>`,
      `<strong>Breakout patterns:</strong> "Chart Patterns" by Thomas Bulkowski`,
      `<strong>Technical setup:</strong> "Volatility Squeeze" - TradingView Education`,
      `<strong>Risk management:</strong> "Position Sizing for Volatility" - Van Tharp Institute`,
      `<strong>Practical application:</strong> "Vol Breakout trong VN Market" - StockBiz Analysis`,
    ],
  },

  multiFactorStrategy: {
    key: "multiFactorStrategy",
    name: "Chiến lược Multi-Factor",
    description:
      "Chiến lược kết hợp nhiều yếu tố: giá trị, chất lượng, động lượng và quy mô",
    category: "Đa yếu tố",
    parameters: {
      valueWeight: 0.3,
      qualityWeight: 0.25,
      momentumWeight: 0.25,
      sizeWeight: 0.2,
      rebalanceFrequency: "monthly",
    },
    methodology: `
      <h3>Các Factor chính:</h3>
      <p>Kết hợp 4 factor đã được nghiên cứu rộng rãi:</p>
      <ul>
        <li><strong>Value Factor (30%):</strong> P/E, P/B, EV/EBITDA thấp</li>
        <li><strong>Quality Factor (25%):</strong> ROE, Debt/Equity, Profit Margin</li>
        <li><strong>Momentum Factor (25%):</strong> Price momentum, earnings revision</li>
        <li><strong>Size Factor (20%):</strong> Market cap, small-cap premium</li>
      </ul>
      
      <h3>Scoring methodology:</h3>
      <ul>
        <li>Mỗi factor được score từ 1-10</li>
        <li>Weighted average theo tỷ trọng factor</li>
        <li>Rank toàn bộ universe stocks</li>
        <li>Select top 20-30 stocks</li>
        <li>Equal weight hoặc factor-based weight</li>
      </ul>
      
      <h3>Rebalancing process:</h3>
      <ul>
        <li>Monthly factor scoring update</li>
        <li>Portfolio optimization</li>
        <li>Transaction cost consideration</li>
        <li>Risk management overlay</li>
      </ul>
    `,
    examples: [
      `
        <h4>Ví dụ Portfolio tháng 10/2024:</h4>
        <p><strong>Top holdings after factor screening:</strong></p>
        <ul>
          <li><strong>VNM (8.5/10):</strong> High quality + reasonable value</li>
          <li><strong>HPG (8.2/10):</strong> Strong momentum + quality</li>
          <li><strong>VCB (8.0/10):</strong> Quality leader + momentum</li>
          <li><strong>VHM (7.8/10):</strong> Value play + size factor</li>
          <li><strong>MSN (7.5/10):</strong> Balanced across all factors</li>
        </ul>
        <p><strong>Portfolio weight:</strong> 20% mỗi stock, rebalance monthly</p>
      `,
      `
        <h4>Factor Performance Analysis:</h4>
        <ul>
          <li><strong>2023:</strong> Value factor outperform (+15% vs VNIndex +12%)</li>
          <li><strong>Q1 2024:</strong> Momentum factor lead (+8% vs VNIndex +2%)</li>
          <li><strong>Q2 2024:</strong> Quality factor defensive (−2% vs VNIndex −8%)</li>
        </ul>
        <p><strong>Diversification benefit:</strong> Smoother returns curve</p>
      `,
    ],
    strengths: [
      "Diversified risk factors",
      "Academic research backing",
      "Long-term outperformance potential",
      "Systematic and disciplined",
      "Reducevs single-factor risk",
      "Adaptable to market conditions",
    ],
    weaknesses: [
      "Complex implementation",
      "High transaction costs",
      "Factor crowding risk",
      "Periods of underperformance",
      "Requires sophisticated tools",
      "Data intensive",
    ],
    conditions: [
      "Sufficient universe của stocks",
      "Access to fundamental data",
      "Low transaction cost environment",
      "Long-term investment horizon",
      "Systematic execution capability",
      "Risk management framework",
    ],
    risks: [
      "⚠️ RỦI RO FACTOR CROWDING: Quá nhiều investor dùng cùng factors",
      "💰 RỦI RO TRANSACTION COST: Rebalancing costs có thể eat vào returns",
      "📊 RỦI RO DATA QUALITY: Poor data quality ảnh hưởng factor scores",
      "🎯 RỦI RO REGIME CHANGE: Factor effectiveness thay đổi theo thời gian",
      "⏰ RỦI RO IMPLEMENTATION: Execution risk trong complex strategy",
      "📈 KHUYẾN CÁO: Cần backtest thoroughly và monitor factor decay",
    ],
    references: [
      `<strong>Academic foundation:</strong> "Fama-French Five-Factor Model" - Journal of Financial Economics`,
      `<strong>Practical guide:</strong> "Your Complete Guide to Factor-Based Investing" by Larry Swedroe`,
      `<strong>Implementation:</strong> <a href="https://www.investopedia.com/terms/f/factor-investing.asp" target="_blank">Investopedia - Factor Investing</a>`,
      `<strong>Research:</strong> "Factor Investing in Emerging Markets" - MSCI Research`,
      `<strong>Vietnamese market:</strong> "Factor Analysis HOSE" - SSI Research`,
      `<strong>Quantitative methods:</strong> "Quantitative Portfolio Management" - Online Courses`,
    ],
  },

  defensiveValue: {
    key: "defensiveValue",
    name: "Chiến lược Defensive Value",
    description:
      "Chiến lược tập trung vào cổ phiếu giá trị với tính phòng thủ cao trong thời kỳ bất ổn",
    category: "Giá trị",
    parameters: {
      peRatio: 15,
      debtToEquity: 0.5,
      dividendYield: 0.04,
      roeThreshold: 0.15,
      riskPercentage: 0.08,
    },
    methodology: `
      <h3>Nguyên tắc Defensive Value:</h3>
      <p>Kết hợp value investing với defensive characteristics:</p>
      <ul>
        <li><strong>Value Metrics:</strong> P/E < 15, P/B < 2, EV/EBITDA < 10</li>
        <li><strong>Quality Metrics:</strong> ROE > 15%, ROA > 8%, Profit Margin > 10%</li>
        <li><strong>Defensive Metrics:</strong> Low beta, stable earnings, strong balance sheet</li>
      </ul>
      
      <h3>Screening criteria:</h3>
      <ul>
        <li>P/E ratio reasonable (< 15)</li>
        <li>Debt/Equity < 50%</li>
        <li>Dividend yield > 4%</li>
        <li>Consistent earnings growth</li>
        <li>Strong competitive moat</li>
        <li>Recession-resistant business</li>
      </ul>
      
      <h3>Sector focus:</h3>
      <ul>
        <li>Consumer staples (thực phẩm, đồ uống)</li>
        <li>Utilities (điện, nước, gas)</li>
        <li>Healthcare (dược phẩm)</li>
        <li>Dividend aristocrats</li>
        <li>Essential services</li>
      </ul>
    `,
    examples: [
      `
        <h4>Ví dụ 1: Classic Defensive Value - VNM</h4>
        <p><strong>Valuation metrics (Q3/2024):</strong></p>
        <ul>
          <li>P/E: 12.5 (attractive vs industry 18)</li>
          <li>P/B: 1.8 (reasonable book value)</li>
          <li>ROE: 18% (high quality)</li>
          <li>Debt/Equity: 25% (conservative)</li>
          <li>Dividend yield: 6.2% (attractive income)</li>
        </ul>
        <p><strong>Defensive characteristics:</strong> Essential product, stable demand, market leader</p>
      `,
      `
        <h4>Ví dụ 2: Utility Value Play - POW</h4>
        <p><strong>Investment case:</strong></p>
        <ul>
          <li>Monopoly business (electricity distribution)</li>
          <li>Regulated returns</li>
          <li>Stable cash flows</li>
          <li>Dividend yield 7%+</li>
        </ul>
        <p><strong>Performance:</strong> Lower volatility, steady returns</p>
      `,
    ],
    strengths: [
      "Lower volatility than growth stocks",
      "Attractive dividend income",
      "Downside protection in bear markets",
      "Inflation protection potential",
      "Long-term wealth building",
      "Sleep-well-at-night factor",
    ],
    weaknesses: [
      "Limited upside in bull markets",
      "Value traps possible",
      "Sector concentration risk",
      "Interest rate sensitivity",
      "May underperform growth long-term",
      "Requires patience and discipline",
    ],
    conditions: [
      "Market uncertainty hoặc recession fears",
      "High interest rate environment",
      "Volatile market conditions",
      "Inflation concerns",
      "Risk-off sentiment",
      "Late cycle economic conditions",
    ],
    risks: [
      "⚠️ RỦI RO VALUE TRAP: Có thể mua phải stocks cheap vì lý do xấu",
      "💰 RỦI RO OPPORTUNITY COST: Miss growth opportunities trong bull market",
      "📊 RỦI RO SECTOR CONCENTRATION: Over-weight defensive sectors",
      "🎯 RỦI RO INTEREST RATE: Dividend stocks sensitive với interest rates",
      "⏰ RỦI RO TIMING: Value có thể underperform trong thời gian dài",
      "📈 KHUYẾN CÁO: Balance với growth exposure, không quá defensive",
    ],
    references: [
      `<strong>Value investing master:</strong> "The Intelligent Investor" by Benjamin Graham`,
      `<strong>Defensive investing:</strong> "A Man for All Markets" by Edward Thorp`,
      `<strong>Dividend focus:</strong> <a href="https://www.investopedia.com/terms/d/dividendaristocrat.asp" target="_blank">Investopedia - Dividend Aristocrats</a>`,
      `<strong>Risk management:</strong> "Conservative Investing Strategies" - Bogleheads`,
      `<strong>Vietnamese market:</strong> "Defensive Stocks in Vietnam" - Vietcombank Securities`,
      `<strong>Academic research:</strong> "Value vs Growth Performance" - Financial Analysts Journal`,
    ],
  },

  macdStrategy: {
    key: "macdStrategy",
    name: "Chiến lược MACD",
    description:
      "Chiến lược sử dụng MACD để xác định tín hiệu mua bán dựa trên sự phân kỳ và cắt đường tín hiệu",
    category: "Động lượng",
    parameters: {
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      riskPercentage: 0.08,
    },
    methodology: `
      <h3>Chỉ báo MACD (Moving Average Convergence Divergence):</h3>
      <p>MACD được tạo thành từ 3 thành phần chính:</p>
      <ul>
        <li><strong>MACD Line:</strong> EMA 12 - EMA 26</li>
        <li><strong>Signal Line:</strong> EMA 9 của MACD Line</li>
        <li><strong>Histogram:</strong> MACD Line - Signal Line</li>
      </ul>
      
      <h3>Tín hiệu giao dịch:</h3>
      <ul>
        <li><strong>Bullish Signal:</strong> MACD cắt lên trên Signal Line</li>
        <li><strong>Bearish Signal:</strong> MACD cắt xuống dưới Signal Line</li>
        <li><strong>Divergence:</strong> Giá và MACD đi ngược chiều nhau</li>
      </ul>
      
      <h3>Xác nhận tín hiệu:</h3>
      <ul>
        <li>Zero line crossover</li>
        <li>Histogram thay đổi từ âm sang dương (hoặc ngược lại)</li>
        <li>Kết hợp với xu hướng tổng thể</li>
      </ul>
    `,
    examples: [
      `
        <h4>Ví dụ 1: MACD Bullish Crossover - VCB</h4>
        <p><strong>Ngày 15/05/2024:</strong></p>
        <ul>
          <li>MACD Line: -0.85 → -0.42</li>
          <li>Signal Line: -0.65</li>
          <li>Giá: 89,200 VND</li>
        </ul>
        <p><strong>Tín hiệu:</strong> MACD cắt lên Signal Line, histogram chuyển dương. Khuyến nghị mua.</p>
      `,
      `
        <h4>Ví dụ 2: Bearish Divergence - HPG</h4>
        <p><strong>Tháng 07/2024:</strong></p>
        <ul>
          <li>Giá: Tạo đỉnh cao hơn (26,500 VND)</li>
          <li>MACD: Tạo đỉnh thấp hơn</li>
          <li>Tín hiệu: Divergence bearish</li>
        </ul>
        <p><strong>Kết quả:</strong> Giá giảm 12% trong 3 tuần sau đó.</p>
      `,
    ],
    strengths: [
      "Kết hợp cả trend-following và momentum",
      "Tín hiệu rõ ràng và dễ nhận biết",
      "Hiệu quả trong thị trường trending",
      "Divergence là tín hiệu mạnh",
      "Có thể áp dụng đa khung thời gian",
      "Phổ biến và được kiểm chứng rộng rãi",
    ],
    weaknesses: [
      "Lag indicator, tín hiệu muộn",
      "Nhiều whipsaw trong sideways market",
      "Tín hiệu sai trong thị trường choppy",
      "Phụ thuộc vào setting tham số",
      "Không hiệu quả trong thị trường flat",
      "Cần xác nhận từ các chỉ báo khác",
    ],
    conditions: [
      "Thị trường có xu hướng rõ ràng",
      "Volatility vừa phải đến cao",
      "Khối lượng giao dịch tốt",
      "Timeframe từ H4 trở lên",
      "Không có news impact mạnh",
      "Trend đã được xác lập",
    ],
    risks: [
      "⚠️ RỦI RO WHIPSAW: Nhiều tín hiệu sai trong thị trường choppy",
      "⏰ RỦI RO LAG: Tín hiệu muộn có thể bỏ lỡ phần lớn move",
      "📊 RỦI RO FALSE DIVERGENCE: Divergence không phải lúc nào cũng dẫn đến reversal",
      "💰 RỦI RO OVERCONFIDENCE: Không nên chỉ dựa vào MACD duy nhất",
      "🎯 RỦI RO PARAMETER: Thay đổi setting có thể cho kết quả khác nhau",
      "📈 KHUYẾN CÁO: Luôn kết hợp với price action và support/resistance",
    ],
    references: [
      `<strong>Người phát minh:</strong> Gerald Appel - "Technical Analysis: Power Tools for Active Investors"`,
      `<strong>Hướng dẫn cơ bản:</strong> <a href="https://www.investopedia.com/terms/m/macd.asp" target="_blank">Investopedia - MACD Explained</a>`,
      `<strong>Chiến lược nâng cao:</strong> "MACD Divergence Trading" - TradingView Education`,
      `<strong>Nghiên cứu hiệu quả:</strong> "MACD Signal Reliability" - Journal of Technical Analysis`,
      `<strong>Ứng dụng thực tế:</strong> "MACD trong thị trường Việt Nam" - StockBiz Analysis`,
      `<strong>Video hướng dẫn:</strong> "MACD Strategy for Beginners" - Financial Education Channels`,
    ],
  },

  bollingerBands: {
    key: "bollingerBands",
    name: "Chiến lược Bollinger Bands",
    description:
      "Chiến lược sử dụng dải Bollinger để xác định vùng quá mua/quá bán và breakout",
    category: "Hồi quy trung bình",
    parameters: {
      period: 20,
      stdDev: 2,
      riskPercentage: 0.1,
    },
    methodology: `
      <h3>Dải Bollinger Bands:</h3>
      <p>Bollinger Bands gồm 3 đường:</p>
      <ul>
        <li><strong>Middle Band:</strong> SMA 20 ngày</li>
        <li><strong>Upper Band:</strong> SMA 20 + (2 × Standard Deviation)</li>
        <li><strong>Lower Band:</strong> SMA 20 - (2 × Standard Deviation)</li>
      </ul>
      
      <h3>Nguyên lý giao dịch:</h3>
      <ul>
        <li><strong>Mean Reversion:</strong> Giá có xu hướng quay về trung bình</li>
        <li><strong>Squeeze:</strong> Dải co hẹp báo hiệu breakout sắp tới</li>
        <li><strong>Expansion:</strong> Dải mở rộng cho thấy volatility tăng</li>
      </ul>
      
      <h3>Tín hiệu giao dịch:</h3>
      <ul>
        <li><strong>Mua:</strong> Giá chạm Lower Band và bounce back</li>
        <li><strong>Bán:</strong> Giá chạm Upper Band và pullback</li>
        <li><strong>Breakout:</strong> Giá đóng cửa ngoài dải</li>
      </ul>
    `,
    examples: [
      `
        <h4>Ví dụ 1: Mean Reversion Trade - MSN</h4>
        <p><strong>Ngày 20/06/2024:</strong></p>
        <ul>
          <li>Giá chạm Lower Band tại 78,500 VND</li>
          <li>Middle Band: 82,000 VND</li>
          <li>RSI: 32 (oversold)</li>
        </ul>
        <p><strong>Hành động:</strong> Mua khi giá bounce từ Lower Band, target về Middle Band (+4.5%)</p>
      `,
      `
        <h4>Ví dụ 2: Bollinger Squeeze Breakout - FPT</h4>
        <p><strong>Tháng 08/2024:</strong></p>
        <ul>
          <li>Dải Bollinger co hẹp trong 2 tuần</li>
          <li>Volume giảm dần</li>
          <li>Breakout tăng đột biến với volume cao</li>
        </ul>
        <p><strong>Kết quả:</strong> Giá tăng 15% trong 10 ngày sau breakout</p>
      `,
    ],
    strengths: [
      "Tự động điều chỉnh theo volatility",
      "Hiệu quả trong thị trường range-bound",
      "Cung cấp support/resistance động",
      "Dễ nhận biết tín hiệu squeeze",
      "Kết hợp tốt với các oscillator",
      "Phổ biến và được tin dùng rộng rãi",
    ],
    weaknesses: [
      "Whipsaw nhiều trong trending market",
      "Tín hiệu sai trong strong trend",
      "Phụ thuộc vào setting period và std dev",
      "Không predict direction của breakout",
      "Cần confirmation từ indicators khác",
      "Lag trong việc adjust với trend mới",
    ],
    conditions: [
      "Thị trường sideways hoặc range-bound",
      "Volatility vừa phải",
      "Không có strong trend",
      "Volume pattern bình thường",
      "Timeframe H1 trở lên",
      "Không có major news events",
    ],
    risks: [
      "⚠️ RỦI RO TRENDING: Ineffective trong strong trending markets",
      "📊 RỦI RO FALSE SIGNALS: Nhiều tín hiệu sai khi market trending",
      "💰 RỦI RO WHIPSAW: Có thể bị trapped trong choppy conditions",
      "🎯 RỦI RO BREAKOUT DIRECTION: Không predict được direction của breakout",
      "⏰ RỦI RO TIMING: Entry/exit timing rất quan trọng",
      "📈 KHUYẾN CÁO: Luôn check overall trend trước khi trade",
    ],
    references: [
      `<strong>Người sáng tạo:</strong> John Bollinger - "Bollinger on Bollinger Bands"`,
      `<strong>Website chính thức:</strong> <a href="https://www.bollingerbands.com/" target="_blank">BollingerBands.com</a>`,
      `<strong>Hướng dẫn chi tiết:</strong> <a href="https://www.investopedia.com/terms/b/bollingerbands.asp" target="_blank">Investopedia - Bollinger Bands</a>`,
      `<strong>Chiến lược nâng cao:</strong> "Bollinger Band Squeeze Strategy" - TradingView`,
      `<strong>Nghiên cứu:</strong> "Statistical Properties of Bollinger Bands" - Technical Analysis Journal`,
      `<strong>Ứng dụng thực tế:</strong> "Bollinger Bands trên HOSE" - VietstockTraders Forum`,
    ],
  },

  breakoutStrategy: {
    key: "breakoutStrategy",
    name: "Chiến lược Breakout",
    description:
      "Chiến lược đột phá khỏi vùng kháng cự/hỗ trợ với volume xác nhận",
    category: "Đột phá",
    parameters: {
      volumeThreshold: 1.5,
      breakoutConfirmation: 3,
      riskPercentage: 0.12,
    },
    methodology: `
      <h3>Nguyên lý Breakout Trading:</h3>
      <p>Breakout xảy ra khi giá vượt qua vùng support/resistance quan trọng:</p>
      <ul>
        <li><strong>Resistance Breakout:</strong> Giá vượt lên trên vùng kháng cự</li>
        <li><strong>Support Breakdown:</strong> Giá thủng xuống dưới vùng hỗ trợ</li>
        <li><strong>Volume Confirmation:</strong> Volume tăng mạnh khi breakout</li>
      </ul>
      
      <h3>Xác định vùng quan trọng:</h3>
      <ul>
        <li>Đỉnh/đáy lịch sử</li>
        <li>Trendlines quan trọng</li>
        <li>Psychological levels (50k, 100k VND...)</li>
        <li>Moving averages dài hạn</li>
      </ul>
      
      <h3>Điều kiện breakout hợp lệ:</h3>
      <ul>
        <li>Volume tăng ít nhất 150% so với average</li>
        <li>Giá đóng cửa ngoài vùng S/R</li>
        <li>Không có immediate pullback</li>
        <li>Momentum indicators support</li>
      </ul>
    `,
    examples: [
      `
        <h4>Ví dụ 1: Resistance Breakout - VHM</h4>
        <p><strong>Ngày 12/09/2024:</strong></p>
        <ul>
          <li>Resistance tại 42,000 VND (test 3 lần)</li>
          <li>Breakout tại 42,300 VND</li>
          <li>Volume: 250% so với 20-day average</li>
          <li>Target: 46,200 VND (+10%)</li>
        </ul>
        <p><strong>Kết quả:</strong> Đạt target sau 2 tuần</p>
      `,
      `
        <h4>Ví dụ 2: Triangle Breakout - VNM</h4>
        <p><strong>Tháng 10/2024:</strong></p>
        <ul>
          <li>Symmetric triangle pattern trong 1 tháng</li>
          <li>Apex tại 84,500 VND</li>
          <li>Upward breakout với gap up</li>
          <li>Volume spike 300%</li>
        </ul>
        <p><strong>Kết quả:</strong> Rally 8% trong 5 sessions</p>
      `,
    ],
    strengths: [
      "Profit potential lớn khi breakout thành công",
      "Clear entry/exit signals",
      "Có thể catch major moves",
      "Risk/reward ratio tốt",
      "Áp dụng được nhiều timeframes",
      "Volume confirmation tăng reliability",
    ],
    weaknesses: [
      "False breakouts rất phổ biến",
      "Slippage cao khi breakout gap",
      "Cần experience để identify key levels",
      "Market có thể reverse ngay sau breakout",
      "Emotional pressure cao",
      "Requires quick decision making",
    ],
    conditions: [
      "Thị trường có volatility tốt",
      "Clear support/resistance levels",
      "Volume pattern bình thường trước breakout",
      "Không có conflicting news",
      "Strong momentum indicators",
      "Liquidity tốt của cổ phiếu",
    ],
    risks: [
      "⚠️ RỦI RO FALSE BREAKOUT: 70% breakouts là false, cần stop-loss chặt",
      "💰 RỦI RO SLIPPAGE: Gap moves có thể cause significant slippage",
      "🎯 RỦI RO FOMO: Tâm lý FOMO có thể khiến entry muộn",
      "📊 RỦI RO REVERSAL: Market có thể reverse ngay sau breakout",
      "⏰ RỦI RO TIMING: Cần react nhanh khi breakout xảy ra",
      "📈 KHUYẾN CÁO: Chỉ trade breakout khi có volume confirmation mạnh",
    ],
    references: [
      `<strong>Sách kinh điển:</strong> "How to Make Money in Stocks" by William O'Neil`,
      `<strong>Breakout patterns:</strong> <a href="https://www.investopedia.com/terms/b/breakout.asp" target="_blank">Investopedia - Breakout Trading</a>`,
      `<strong>Volume analysis:</strong> "Volume Price Analysis" by Anna Coulling`,
      `<strong>Chart patterns:</strong> "Encyclopedia of Chart Patterns" by Thomas Bulkowski`,
      `<strong>Thực hành:</strong> "Breakout Trading Strategies" - TradingView Education`,
      `<strong>Case studies:</strong> "Famous Breakouts in Vietnamese Stocks" - VnExpress Stocks`,
    ],
  },
};
