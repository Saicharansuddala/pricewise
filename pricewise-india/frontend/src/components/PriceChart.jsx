import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#FF0000', '#F57C00', '#FBC02D', '#388E3C', '#1976D2', '#7B1FA2', '#C2185B'];
const MOCK_PLATFORMS = ['zomato', 'swiggy', 'blinkit', 'zepto', 'bigbasket', 'dmart', 'jiomart'];

export default function PriceChart({ history }) {
  const data = [];
  if (history) {
    const datesMap = {};
    Object.keys(history).forEach(platform => {
      history[platform].forEach(point => {
        const d = new Date(point.scrapedAt).toLocaleDateString();
        if (!datesMap[d]) datesMap[d] = { name: d };
        datesMap[d][platform] = point.totalPrice;
      });
    });
    data.push(...Object.values(datesMap));
  }

  return (
    <div className="w-full h-80 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
      <h3 className="text-lg font-bold mb-4">30-Day Price History</h3>
      {data.length === 0 ? <p className="text-gray-500">Not enough data to plot.</p> :
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {MOCK_PLATFORMS.map((plat, i) => <Line key={plat} type="monotone" dataKey={plat} stroke={COLORS[i % COLORS.length]} />)}
        </LineChart>
      </ResponsiveContainer>
      }
    </div>
  );
}
