import Home from './Pages/Home';
import CreateUsers from './Pages/CreateUsers';
import Login from './Pages/Login';
import Leftbar from './Leftbar';
import LandingPage from './Pages/LandingPage';
import Tolpbar from './Tolpbar';
import CreateTournaments from './Pages/CreateTournaments';
import MyTournaments from './Pages/MyTournaments';
import AccountUser from './Pages/AccountUser';
import CompetitorView from './PraticipentView/CompetitorView';
import CreateDivision from './Pages/CreateDivision';
import SeeDivisions from './Pages/SeeDivisions';
import DisplayParticipents from './PraticipentView/DisplayParticipents';
import EditUser from './Pages/EditUser';
import SeeParticepents from './Pages/SeeParticepents';
import ForgotPass from './Pages/ForgotPass';
import { ParticipentForm } from './PraticipentView/ParticipentForm';
import { Divisions } from './PraticipentView/Divisions';
import {AuthContext} from './helpers/AuthContext';
import { RecoverPassword } from './RecoverPassword';
import BracketApp from './Brackets/BracketApp';
import PointTracker from './Brackets/PointTracker';
import ParticipentVer from './Pages/ParticipentVer';
import TournamentView from './PraticipentView/TournamentView';
import DivisionsView from './PraticipentView/DivisionsView';
import ParticipentsView from './PraticipentView/ParticipentsView';
import ParticipentBracket from './PraticipentView/ParticipentBracket';
import WatchPage from './Streaming/WatchPage';
import CreateStream from './Streaming/CreateStream';
import GetViewerToken from './Streaming/GetViewerToken';
import ViewerTour from './Viewer/ViewerTour';
import { ViewerDivisions } from './Viewer/ViewerDivisions';
import ViewerBrackets from './Viewer/ViewerBrackets';
import ViewRecordings from './Viewer/ViewRecordings';
import { ParticipantLogin } from './PraticipentView/ParticipantLogin';
import PartEmailVer from "./PraticipentView/PartEmailVer";
import DisplayCart from "./Pages/DisplayCart";
import DivisionsInOrder from './Viewer/DivisionsInOrder';
import RegistrationTypeSelector from './Pages/RegistrationTypeSelector';
import ParentRegistrationForm from './Pages/ParentRegistrationForm';
import ParentChilds from './Pages/ParentChilds';
import ParentEmailVer from './Pages/ParentEmailVer';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
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
          <Route path='/' element={!accessToken ? <Navigate to="/LandingPage" /> : <Navigate to="/Home" />} />
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
          </Routes>
        </div>
      </div>
    </AuthContext.Provider> 
    </Router>
    </div>
  );
}

export default App;