import React from 'react'
import * as Icon from 'react-bootstrap-icons';

function SearchUser({searchKey, setSearchKey}) {
  return (
    <div className='relative text-xs w-full' id="searchUserBar">
        <input type="text" placeholder="search user..." className='rounded-full pl-9 w-full'
        value={searchKey}
        onChange={(e) => setSearchKey(e.target.value)}></input>
        <Icon.Search className='absolute top-2 left-2 bg-white'></Icon.Search>
    </div>
  )
}

export default SearchUser