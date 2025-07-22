import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/Dashboard";
import UploadVideo from "./pages/UploadVideo";
import CreateTweet from "./pages/CreateTweet";
import PrivateRoute from "./components/PrivateRoute";
import VideoPage from "./pages/VideoPage";
import WatchHistory from "./pages/WatchHistory";
import SubscriptionPage from "./pages/SubscriptionPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload-video"
          element={
            <PrivateRoute>
              <UploadVideo />
            </PrivateRoute>
          }
        />
        <Route
          path="/new-tweet"
          element={
            <PrivateRoute>
              <CreateTweet />
            </PrivateRoute>
          }
        />
        <Route path="/video/:videoId" element={<PrivateRoute><VideoPage /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><WatchHistory /></PrivateRoute>} />
        <Route path="/subscriptions" element={<PrivateRoute><SubscriptionPage /></PrivateRoute>} />
        <Route path="/watch-history" element={<WatchHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
