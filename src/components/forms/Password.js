

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
                    />
                    <button
                        type="button"
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{border: 'none', background: 'none', zIndex: 10}}
                    >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                    </button>
                </div>
                <small className="text-muted mt-2 d-block">
                    Use at least 8 characters with a mix of letters, numbers and symbols
                </small>
            </div>
        </div>
    );
}

export default Password;