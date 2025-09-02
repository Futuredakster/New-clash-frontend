import Home from './Pages/admin/Home';
import CreateUsers from './Pages/admin/CreateUsers';
import Login from './Pages/auth/Login';
import Leftbar from './components/navigation/Leftbar';
import LandingPage from './Pages/auth/LandingPage';
import Tolpbar from './components/navigation/Tolpbar';
import CreateTournaments from './Pages/admin/CreateTournaments';
import MyTournaments from './Pages/admin/MyTournaments';
import AccountUser from './Pages/admin/AccountUser';
import CompetitorView from './features/participant/CompetitorView';
import CreateDivision from './Pages/admin/CreateDivision';
import SeeDivisions from './Pages/admin/SeeDivisions';
import DisplayParticipents from './features/participant/DisplayParticipents';
import EditUser from './Pages/admin/EditUser';
import SeeParticepents from './Pages/admin/SeeParticepents';
import ForgotPass from './Pages/auth/ForgotPass';
import { ParticipentForm } from './features/participant/ParticipentForm';
import { Divisions } from './features/participant/Divisions';
import {AuthContext} from './context/AuthContext';
import { RecoverPassword } from './components/RecoverPassword';
import BracketApp from './features/brackets/BracketApp';
import PointTracker from './features/brackets/PointTracker';
import ParticipentVer from './Pages/participant/ParticipentVer';
import TournamentView from './features/participant/TournamentView';
import DivisionsView from './features/participant/DivisionsView';
import ParticipentsView from './features/participant/ParticipentsView';
import ParticipentBracket from './features/participant/ParticipentBracket';
import WatchPage from './features/streaming/WatchPage';
import CreateStream from './features/streaming/CreateStream';
import GetViewerToken from './features/streaming/GetViewerToken';
import ViewerTour from './features/viewer/ViewerTour';
import { ViewerDivisions } from './features/viewer/ViewerDivisions';
import ViewerBrackets from './features/viewer/ViewerBrackets';
import ViewRecordings from './features/viewer/ViewRecordings';
import { ParticipantLogin } from './features/participant/ParticipantLogin';
import PartEmailVer from "./features/participant/PartEmailVer";
import DisplayCart from "./Pages/admin/DisplayCart";
import DivisionsInOrder from './features/viewer/DivisionsInOrder';
import RegistrationTypeSelector from './Pages/auth/RegistrationTypeSelector';
import ParentRegistrationForm from './Pages/parent/ParentRegistrationForm';
import ParentChilds from './Pages/parent/ParentChilds';
import ParentEmailVer from './Pages/parent/ParentEmailVer';
import LoginTypeSelector from './Pages/auth/LoginTypeSelector';
import ParentVer from './Pages/parent/ParentVer';
import ParentDetails from './Pages/parent/ParentDetails';
import ParticipantDetails from './Pages/participant/ParticipantDetails';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './assets/styles/App.css';
import {BrowserRouter as Router,Route,Routes,Navigate} from 'react-router-dom';
import { link } from './constant';

const accessToken = localStorage.getItem("accessToken");
const token = localStorage.getItem("participantAccessToken");
const parentToken = localStorage.getItem("parentToken");


function App() {
const [authState, setAuthState] = useState({username:"", id:0, status:false,accoint_id:0});
const [props, setProps] = useState([]);
const [division,setDivision] = useState([]);
const [partState, setPartState] = useState([{id: 0,name:"",status:false}]);
const [parentState, setParentState] = useState({id: 0,name:"",status:false});

console.log(props);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('parentToken');
      localStorage.removeItem('participantAccessToken');
      localStorage.removeItem('accessToken');
      window.location.href = '/landingpage';
    }
    return Promise.reject(error);
  }
);




useEffect(() => {
  console.log("firing api");
  if (!accessToken) {
    // Handle the case where there is no access token (e.g., redirect to login page)
    setAuthState({...authState, status:false});
  } else{
  axios.get(`${link}/users/auth`, {
    headers: {
      accessToken: accessToken,
    },
  })
    .then((response) => {
      console.log("got a response", response);
      if (response.data.error) {
        setAuthState({...authState, status:false});
      } else {
        console.log(response.data.username);
        console.log(response.data.account_id)
        setAuthState({username:response.data.username, id:response.data.id, status:true,account_id:response.data.account_id, role:response.data.role});
      }
    });
  }
},[]); 

useEffect(() => {
  if (!token) {
    setPartState({...partState, status:false});
   } else {
    axios.get(`${link}/participants/auths`, {
      headers:{
        participantAccessToken: token
      },
    })
     .then((response) => {
      if (response.data.error) {
        setPartState({...partState, status:false});
      } else {
        setPartState({id:response.data.id,name:response.data.name,status:true});
      }
     });
    }
  },[]);

  useEffect(() => {
    if (!parentToken) {
      setParentState({...parentState, status:false});
    } else {
      axios.get(`${link}/parents/auth`, {
        headers: {
          parentAccessToken: parentToken
        }
      })
      .then((response) => {
        if (response.data.error) {
          setParentState({...parentState, status:false});
        } else {
          setParentState({id:response.data.id,name:response.data.name,status:true});
        }
      });
    }
  },[]);





  return (
   <div className="min-vh-100" style={{background: 'var(--light-grey)'}}>
    <Router>
    <AuthContext.Provider value={{authState, setAuthState, partState, setPartState, parentState, setParentState}}>
      {/* Top Navigation */}
      <Tolpbar/>
      
      {/* Main Layout */}
      <div className='d-flex' style={{paddingTop: '76px'}}>
        {/* Sidebar - only show when authenticated and on large screens */}
        {authState.status && (
          <div className="sidebar-modern d-none d-lg-block" style={{width: '280px', minHeight: 'calc(100vh - 76px)'}}>    
                <Leftbar />
          </div>
        )}
        
        {/* Main Content */}
        <div className={`flex-grow-1 ${authState.status ? '' : 'w-100'}`} style={{minHeight: 'calc(100vh - 76px)'}}>
          <Routes>
        <Route path='/Login' exact element ={<Login/>} />
          <Route path='/CreateUsers' exact element ={<CreateUsers/>} />
          <Route path='/' element={!accessToken ? <Navigate to="/LandingPage" replace /> : <Navigate to="/Home" replace />} />
          <Route path='/AccountUser' exact element ={<AccountUser/>} />
          <Route path='/CompetitorView' exact element = {<CompetitorView setProps={setProps} />} />
          <Route path='/LandingPage' exact element ={<LandingPage/>} />
          <Route path='/CreateTournaments' exact element ={<CreateTournaments/>} />
          <Route path ='SeeParticepents' exact element= {<SeeParticepents/>} />
          <Route path='/MyTournaments' exact element= {<MyTournaments />} />
          <Route path='EditUser' exact element= {<EditUser/>} />
          <Route path='/Home' exact element={<Home  />} />
          <Route path='/CreateDivision' exact element={<CreateDivision/>} />
          <Route path='/seeDivisions' exact element={<SeeDivisions/>} />
          <Route path='/Divisions' exact element={<Divisions props={props} setProps={setProps} setDivision={setDivision}/>} />
          <Route path ='/Form' exact element ={<ParticipentForm division={division} />} />
          <Route path ='DisplayParticipents' exact element = {<DisplayParticipents/>} />
          <Route path ='RecoverPassword' exact element = {<RecoverPassword/>} />
          <Route path ='ForgotPass' exact element = {<ForgotPass/>} />
          <Route path ='BracketApp' exact element = {<BracketApp/>} />
          <Route path ='PointTracker' exact element= {<PointTracker/>} />
          <Route path ='ParticipetnVer' exact element = {<ParticipentVer/>} />
          <Route path ='TournamentView' exact element = {<TournamentView/>} />
          <Route path ='DivisionsView' exact element = {<DivisionsView/>} />
          <Route path ='ParticipentsView' exact element = {<ParticipentsView/>} />
          <Route path ='ParticipentBracket' exact element = {<ParticipentBracket/>} />
          <Route path="/watch" element={<WatchPage />} />
          <Route path="/stream" element={<CreateStream />} />
          <Route path ="/viewer" element={<GetViewerToken/>} />
          <Route path ="/ViewerTour" element={<ViewerTour setProps={setProps} />} />
          <Route path ="/ViewerDivisions" element={<ViewerDivisions props={props} setProps={setProps} setDivision={setDivision}/>} />
          <Route path ="/ViewerBrackets" element={<ViewerBrackets />} />
          <Route path ="/ViewRecordings" element={<ViewRecordings />} />
          <Route path ="/ParticipantLogin" element={<ParticipantLogin />} />
          <Route path ="/PartEmailVer" element={<PartEmailVer />} />
          <Route path ="/DisplayCart" element={<DisplayCart />} />
          <Route path ="/DivisionsInOrder" element={<DivisionsInOrder />} />
          <Route path ="/RegistrationTypeSelector" element={<RegistrationTypeSelector />} />
          <Route path ="/ParentRegistration" element={<ParentRegistrationForm />} />
          <Route path ="/ParentChilds" element={<ParentChilds />} />
          <Route path ="/ParentEmailVer" element={<ParentEmailVer />} />
          <Route path ="/LoginTypeSelector" element={<LoginTypeSelector />} />
          <Route path='/ParentVer' element={<ParentVer />} />
          <Route path='/ParentDetails' element={<ParentDetails />} />
          <Route path='/ParticipantDetails' element={<ParticipantDetails />} />
          </Routes>
        </div>
      </div>
    </AuthContext.Provider> 
    </Router>
    </div>
  );
}

export default App;