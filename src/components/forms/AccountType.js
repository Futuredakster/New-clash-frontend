function AccountType({info,setInfo}){
    return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100">
            <div className="form-group-modern w-100" style={{maxWidth: '400px'}}>
                <label className="form-label-modern">Account Type</label>
                <input
                    type="text"
                    className="form-control-modern"
                    placeholder="e.g., Organization, Personal, Sports Club"
                    value={info.account_type}
                    onChange={(e) => {
                        setInfo({ ...info,account_type: e.target.value });
                    }}
                />
                <small className="text-muted mt-2 d-block">
                    Choose the type that best describes your account purpose
                </small>
            </div>
        </div>
    );
}

export default AccountType;