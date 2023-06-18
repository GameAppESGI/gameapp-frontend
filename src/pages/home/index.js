import React from 'react'
import SearchUser from './components/SearchUser'
import ChatArea from './components/ChatArea'
import UserList from './components/UserList';

function Home() {
  const [searchKey, setSearchKey] = React.useState("");
  return (
    <div className='flex gap-5'>

      <div className='w-96'>
        <SearchUser 
          searchKey={searchKey}
          setSearchKey={setSearchKey}
        />
        <UserList
          searchKey={searchKey}
        />

      </div>

      <div>
        <ChatArea/>
      </div>
    </div>
  )
}

export default Home