import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BACKEND_URL = 'https://url-shortener-assignment.onrender.com';

function TopicAnalytics({ token }) {
  const { topic } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopicAnalytics();
  }, [topic, token]);

  const fetchTopicAnalytics = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/analytics/topic/${topic}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch topic analytics');
      const data = await response.json();
      setData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load topic analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error || !data) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  const clicksChartData = {
    labels: Object.keys(data.clicksByDate),
    datasets: [
      {
        label: 'Clicks by Date',
        data: Object.values(data.clicksByDate),
        borderColor: 'rgb(79, 70, 229)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Topic Analytics: {topic}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-500">Total Clicks</p>
              <p className="text-2xl font-bold">{data.totalClicks}</p>
            </div>
            <div>
              <p className="text-gray-500">Unique Users</p>
              <p className="text-2xl font-bold">{data.uniqueUsers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Clicks Over Time</h2>
          <div className="h-64">
            <Line data={clicksChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">URLs in this Topic</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Short URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unique Users
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.urls.map((url) => (
                  <tr key={url.shortUrl}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {url.shortUrl}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {url.totalClicks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {url.uniqueUsers}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopicAnalytics;