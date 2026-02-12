import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './app.css'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Header from './components/header.jsx'
import Footer from './components/footer.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/signup.jsx'
import Dashboard from './pages/dashboard.jsx'

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
            <Footer />
        </Router>
    )
}

export default App