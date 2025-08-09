function AccountDescript({info,setInfo}){
    return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100">
            <div className="form-group-modern w-100" style={{maxWidth: '400px'}}>
                <label className="form-label-modern">Account Description</label>
                <textarea
                    className="form-control-modern"
                    rows={4}
                    placeholder="Brief description of your organization or purpose for using Clash..."
                    value={info.account_description}
                    onChange={(e) => {
                        setInfo({ ...info, account_description: e.target.value });
                    }}
                />
                <small className="text-muted mt-2 d-block">
                    Tell others about your organization and what tournaments you plan to host
                </small>
            </div>
        </div>
    );
}

export default AccountDescript;