import './App.css'
import AppRoutes from './AppRoutes';
import {ToastContainer} from './components/Toast';
import './lib/i18n.ts'
function App() {

    return (
        <>
            <ToastContainer/>
            <AppRoutes/>
        </>
    )
}

export default App
