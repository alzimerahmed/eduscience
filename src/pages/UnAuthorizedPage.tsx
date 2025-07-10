import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col text-center px-4">
      <h1 className="text-3xl font-bold text-red-600">🚫 Access Denied</h1>
      <p className="text-gray-700 dark:text-gray-300 mt-2 mb-4">
        You do not have permission to view this page.
      </p>
      <Link
        to="/"
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
      >
        Go Home
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
