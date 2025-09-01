

import { useState } from 'react';

function Password({info,setInfo}){
    const [showPassword, setShowPassword] = useState(false);
    
    return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100">
            <div className="form-group-modern w-100" style={{maxWidth: '400px'}}>
                <label className="form-label-modern">Password</label>
                <div className="position-relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        className="form-control-modern"
                        placeholder="Create a secure password"
                        value={info.password_hash}
                        onChange={(e) => {
                            setInfo({ ...info, password_hash: e.target.value });
                        }}
                        style={{paddingRight: '50px'}}
                    />
                    <i 
                        className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted position-absolute`}
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            right: '15px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            zIndex: 10
                        }}
                    ></i>
                </div>
                <small className="text-muted mt-2 d-block">
                    Use at least 8 characters with a mix of letters, numbers and symbols
                </small>
            </div>
        </div>
    );
}

export default Password;