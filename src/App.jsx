import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PendingApproval from "./pages/PendingApproval";
import Dashboard from "./pages/Dashboard";
import FileDetails from "./pages/FileDetails";
import Admin from "./pages/Admin";
import CreateFile from "./pages/CreateFile";

export default function App() {
return ( <BrowserRouter> <Routes>
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
<Route
path="/pending-approval"
element={<PendingApproval />}
/>
<Route path="/" element={<Dashboard />} />
<Route path="/files/:id" element={<FileDetails />} />
<Route path="/admin/users" element={<Admin />} />
<Route path="/files/new" element={<CreateFile />} />

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
</BrowserRouter>

);
}
