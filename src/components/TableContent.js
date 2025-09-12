import ItemList from './ItemList';
const TableContent = ({items,accountId}) => {
    return(
        <main style={{width: '100%'}}>
            <ItemList
                items={items}
                accountId={accountId}
            />
        </main>
    )
}




export default TableContent