import { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function OverallAnalytics({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOverallAnalytics();
  }, [token]);

  const fetchOverallAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/overallAnalytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch overall analytics');
      const result = await response.json();
      console.log('Overall Analytics Response', result);
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching overall analytics', err);
      setError(err.message);
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
    labels: data.clicksByDate.map(entry => entry.date),
    datasets: [
      {
        label: 'Clicks by Date',
        data: data.clicksByDate.map(entry => entry.clicks),
        borderColor: 'rgb(79, 70, 229)',
        tension: 0.1,
      },
    ],
  };

  const osChartData = {
    labels: data.osType.map(entry => entry.osName),
    datasets: [
      {
        label: 'Clicks by OS',
        data: data.osType.map(entry => entry.uniqueClicks),
        backgroundColor: [
          'rgba(79, 70, 229, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(245, 158, 11, 0.5)',
        ],
      },
    ],
  };

  const deviceChartData = {
    labels: data.deviceType.map(entry => entry.deviceName),
    datasets: [
      {
        label: 'Clicks by Device',
        data: data.deviceType.map(entry => entry.uniqueClicks),
        backgroundColor: [
          'rgba(79, 70, 229, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Overall Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total URLs</h2>
          <p className="text-3xl font-bold text-indigo-600">{data.totalUrls}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Clicks</h2>
          <p className="text-3xl font-bold text-indigo-600">{data.totalClicks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Unique Users</h2>
          <p className="text-3xl font-bold text-indigo-600">{data.uniqueUsers}</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Clicks Over Time</h2>
          <div className="h-64">
            <Line data={clicksChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Operating Systems</h2>
            <div className="h-64">
              <Doughnut data={osChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Device Types</h2>
            <div className="h-64">
              <Doughnut data={deviceChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverallAnalytics;
