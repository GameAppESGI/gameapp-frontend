import React from 'react'
import * as Icon from 'react-bootstrap-icons';

function SearchUser({searchKey, setSearchKey}) {
  return (
    <div className='relative'>
        <input type="text" placeholder="search user..." className='rounded-full pl-9 col-6'
        value={searchKey}
        onChange={(e) => setSearchKey(e.target.value)}></input>
        <Icon.Search className='absolute top-2 left-2'></Icon.Search>
    </div>
  )
}

export default SearchUser