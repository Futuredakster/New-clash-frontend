const Searchbar= ({search, setSearch, placeholder = "Search tournaments...", ariaLabel}) => {
    return(
        <div className="d-flex justify-content-center">
            <div className="search-modern" style={{maxWidth: '600px', width: '100%'}}>
                <form onSubmit={(e)=> e.preventDefault()}>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder={placeholder}
                        aria-label={ariaLabel || placeholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)} 
                    />
                   
                </form>
            </div>
        </div>
    );
}
export default Searchbar