function Credantials({ info, setInfo }) {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100">
            <div className="form-group-modern w-100" style={{maxWidth: '400px'}}>
                <label className="form-label-modern">Email Address</label>
                <input
                    type="email"
                    className="form-control-modern"
                    placeholder="your.email@example.com"
                    value={info.email}
                    onChange={(e) => {
                        setInfo({ ...info, email: e.target.value });
                    }}
                />
                <small className="text-muted mt-2 d-block">
                    We'll use this email for account verification and notifications
                </small>
            </div>
        </div>
    );
}
  
  export default Credantials;