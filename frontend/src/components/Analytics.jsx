import  { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const BACKEND_URL = 'https://url-shortener-assignment.onrender.com';

function Analytics({ token }) {
  const { alias } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [alias, token]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/analytics/${alias}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics. Please try again later.');
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

  const osChartData = {
    labels: Object.keys(data.osType),
    datasets: [
      {
        label: 'Clicks by OS',
        data: Object.values(data.osType).map((os) => os.uniqueClicks),
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
      },
    ],
  };

  const deviceChartData = {
    labels: Object.keys(data.deviceType),
    datasets: [
      {
        label: 'Clicks by Device',
        data: Object.values(data.deviceType).map((device) => device.uniqueClicks),
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">URL Analytics</h1>

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
          <h2 className="text-xl font-semibold mb-4">Operating Systems</h2>
          <div className="h-64">
            <Bar data={osChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Device Types</h2>
          <div className="h-64">
            <Bar data={deviceChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;