function AccountName({info,setInfo}){
    return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100">
            <div className="form-group-modern w-100" style={{maxWidth: '400px'}}>
                <label className="form-label-modern">Account Name</label>
                <input
                    type="text"
                    className="form-control-modern"
                    placeholder="e.g., City Championship League, John's Sports Events"
                    value={info.account_name}
                    onChange={(e) => {
                        setInfo({ ...info, account_name: e.target.value });
                    }}
                />
                <small className="text-muted mt-2 d-block">
                    This will be displayed as your organization name
                </small>
            </div>
        </div>
    );
}

export default AccountName;