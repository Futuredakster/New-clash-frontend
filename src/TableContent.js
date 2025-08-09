import ItemList from './ItemList';
const TableContent = ({items,accountId}) => {
    return(
        <main>
       
            <ItemList
                items={items}
                accountId={accountId}
            />
    </main>
    )
}




export default TableContent