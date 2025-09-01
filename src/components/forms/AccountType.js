import { useState } from 'react';

function AccountType({info, setInfo}){
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customAccountType, setCustomAccountType] = useState('');

    const karateAccountTypes = [
        'Karate Dojo',
        'Martial Arts School',
        'Karate Tournament Organizer', 
        'Karate Federation',
        'Sports Club',
        'Individual Instructor',
        'Training Academy',
        'Competition Team',
        'Other'
    ];

    const handleSelectionChange = (e) => {
        const selectedValue = e.target.value;
        
        if (selectedValue === 'Other') {
            setShowCustomInput(true);
            setInfo({ ...info, account_type: customAccountType });
        } else {
            setShowCustomInput(false);
            setCustomAccountType('');
            setInfo({ ...info, account_type: selectedValue });
        }
    };

    const handleCustomInputChange = (e) => {
        const customValue = e.target.value;
        setCustomAccountType(customValue);
        setInfo({ ...info, account_type: customValue });
    };

    return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100">
            <div className="form-group-modern w-100" style={{maxWidth: '400px'}}>
                <label className="form-label-modern">Account Type</label>
                <select
                    className="form-control-modern"
                    value={showCustomInput ? 'Other' : info.account_type}
                    onChange={handleSelectionChange}
                >
                    <option value="">Select account type...</option>
                    {karateAccountTypes.map((type, index) => (
                        <option key={index} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
                
                {showCustomInput && (
                    <input
                        type="text"
                        className="form-control-modern mt-3"
                        placeholder="Enter your custom account type"
                        value={customAccountType}
                        onChange={handleCustomInputChange}
                    />
                )}
                
                <small className="text-muted mt-2 d-block">
                    Choose the type that best describes your karate-related account
                </small>
            </div>
        </div>
    );
}

export default AccountType;