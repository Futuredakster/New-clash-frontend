const Searchbar= ({search,setSearch}) => {
    return(
        <div className="d-flex justify-content-center">
            <div className="search-modern" style={{maxWidth: '600px', width: '100%'}}>
                <form onSubmit={(e)=> e.preventDefault()}>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search tournaments..."
                        aria-label="Search tournaments"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)} 
                    />
                   
                </form>
            </div>
        </div>
    );
}
export default Searchbar