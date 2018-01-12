const { createStore } = Redux;
var add_counter=0; //TODO: Synchronize counter as well
var comp_playlist_ptr=null;
let playlist_store = createStore(playlist_functions);
// Action creators
function ac_delete_id(index) {
    return {
        type: 'DELETEID',
        index: index
    }
}

function ac_add_item(text) {
    add_counter+=1;
    return {
        type: 'ADDITEM',
        text: text+add_counter
    }
}

function ac_set_items(items) {
    return {
        type: 'SETITEMS',
        items: items
    }
}

function playlist_functions(playlist=[], action) {
    switch(action.type) {
    case 'ADDITEM':
        playlist.push(action.text);
        break;
    case 'DELETEID':
        playlist.splice(action.index,1);
        break;
    case 'SETITEMS':
        playlist=action.items;
        break;
    }
    return playlist
}

function push_to_local_storage(key, value) {
    localStorage.setItem(key,value);
}

function sync_delete_id(index) {
    playlist_store.dispatch(ac_delete_id(index));
    push_to_local_storage('playlist_store',playlist_store.getState());
}
function sync_add_item(text) {
    playlist_store.dispatch(ac_add_item(text));
    push_to_local_storage('playlist_store',playlist_store.getState());
}

function playlist_subscriber() {
    if (comp_playlist_ptr != null) {
        comp_playlist_ptr.forceUpdate();
    }
}


window.addEventListener('storage',function(e) {
    if(e.key=='playlist_store') {
        var new_value=e.newValue;
        var items;
        if (new_value.length==0) {
            items=Array();
        }
        else {
            items=e.newValue.split(',');
        }
        playlist_store.dispatch(ac_set_items(items))
    }
});
class Playlist extends React.Component {
    constructor(props) {
        super(props);
        comp_playlist_ptr=this;
    }
    render_item(i) {
        return <PlaylistItem title={playlist_store.getState()[i]} clickHandler={()=>sync_delete_id(i)} />;
    }
    render() {
        var render_items=Array();
        var playlist_items=playlist_store.getState();
        for (var i=0;i<playlist_items.length;i++) {
            render_items[i]=this.render_item(i);
        }
        return (
            <table>
                {render_items}
            </table>
        );
    }
}
class Adder extends React.Component {
    render() {
        return (
            <button onClick={()=>sync_add_item('Item ')}>Button</button>
        );
    }
}
class PlaylistItem extends React.Component {
    render() {
        return (
            <tr><td>{this.props.title}</td><td onClick={()=>this.props.clickHandler()}>DEL</td></tr>
        );
    }
}
playlist_store.subscribe(playlist_subscriber.bind(playlist_store));
playlist_store.dispatch(ac_add_item("Item "));
playlist_store.dispatch(ac_add_item("Item "));
playlist_store.dispatch(ac_add_item("Item "));
ReactDOM.render(
    <div>
    <Adder />
    <Playlist />
    </div>,
    document.getElementById('root')
);
