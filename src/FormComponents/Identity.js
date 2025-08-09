

function Identity({info,setInfo}){
    return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100">
            <div className="form-group-modern w-100" style={{maxWidth: '400px'}}>
                <label className="form-label-modern">Username</label>
                <input
                    type="text"
                    className="form-control-modern"
                    placeholder="Enter your username"
                    value={info.username}
                    onChange={(e) => {
                        setInfo({ ...info, username: e.target.value });
                    }}
                />
                <small className="text-muted mt-2 d-block">
                    Choose a unique username that will identify your account
                </small>
            </div>
        </div>
    );
}

export default Identity;