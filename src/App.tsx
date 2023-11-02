import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import axios from 'axios';
import { Levels, Sentry, Spinner } from "react-activity";
import "react-activity/dist/library.css";
import { members } from "./members";
import 'remixicon/fonts/remixicon.css'
import { toast } from 'react-toastify';
import { LazyLoadImage } from "react-lazy-load-image-component"
import 'react-lazy-load-image-component/src/effects/blur.css';


function App() {
  const [polls, setPolls] = useState([]);
  const [filteredPolls, setFilteredPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membershipId, setmembershipId] = useState(localStorage.getItem('mid') || "");
  const [askMembershipId, setAskMembershipId] = useState(() => {
    return localStorage.getItem("mid") ? false : true
  });
  const [midInput, setmidInput] = useState("");
  const [remainingSlots, setRS] = useState(parseInt(localStorage.getItem('rs') || "100"));
  const [userName, setUserName] = useState(localStorage.getItem('name') || "");
  const [showBackDrop, setSBD] = useState(false)
  const [topChartOn, setTCO] = useState(false);
  const searchBar = useRef(null);

  let params = new URLSearchParams(window.location.search).get("photo");

  let photoActive = {};


  const url = "https://backend-poll.onrender.com/api";
  // const url = "http://localhost:3000/api";

  useEffect(() => {
    axios.get(url + "/user/" + membershipId).then(res => {
      setRS(100 - parseInt(res.data.votes));
      localStorage.setItem('rs', 100 - parseInt(res.data.votes));
      setAskMembershipId(false);
      setSBD(false)
    })
  }, [membershipId])
  useEffect(() => {
    if (!membershipId) {
      setAskMembershipId(true);
    }

    axios.get(url + "/all-polls").then(res => {
      setPolls(res.data.data)
      setFilteredPolls(res.data.data)
      setLoading(false);
    })
  }, [membershipId])

  const saveMembershipId = () => {
    setSBD(true);
    const _refine = midInput.split(" ").join("").trim().toUpperCase();

    const _ = members.filter(value => {
      if (value["Membership ID"]) {
        // console.log(_refine, String(value["Membership ID"]).split(" ").join("").trim());
        if (String(value["Membership ID"]).split(" ").join("").trim() == _refine) return value;
      }
    });
    if (_.length > 0) {
      axios.get(url + "/user/" + _refine).then(res => {
        setRS(100 - parseInt(res.data.votes));
        localStorage.setItem('rs', 100 - parseInt(res.data.votes));
        setUserName(_[0]["Name"]);
        localStorage.setItem('name', _[0]["Name"]);
        setmembershipId(_refine);
        localStorage.setItem('mid', _refine);
        setAskMembershipId(false);
        setSBD(false)
      })
    }
    if (_.length == 0) {
      alert("Membership ID incorrect");
    }
  }


  const makeVote = (photoId: string) => {
    if (!membershipId) {
      setAskMembershipId(true);
      return;
    }
    const data = {
      id: photoId,
      voter: membershipId
    }
    axios.post(url + "/vote", data).then(res => {
      setFilteredPolls(res.data.data);
      setPolls(res.data.data)
      setRS(100 - parseInt(res.data.rs));
      localStorage.setItem("rs", (100 - parseInt(res.data.rs)));
    })
  }

  const getName = (id) => {
    const _ = members.filter(value => {
      if (value["Membership ID"]) {
        // console.log(_refine, String(value["Membership ID"]).split(" ").join("").trim());
        if (String(value["Membership ID"]).split(" ").join("").trim() == id) return value;
      }
    });

    if (_.length > 0) {
      return _[0]["Name"]
    }
  }

  const getAPoll = (id) => {
    const _ = polls.filter(value => {
      if (value.id == id) return value;
    });
    if (_.length > 0) {
      return _[0];
    }
    params = "";
    return;
  }

  if (params != "") {
    photoActive = getAPoll(params);
  }

  const getTopChart = () => {
    let _sorted = polls;
    let sorted = _sorted.sort((a, b) => b.voters.length - a.voters.length);
    return sorted;
  }

  const filterPoll = () => {
    let searchQuery = searchBar.current.value.replace(" ", "").toUpperCase();
    setFilteredPolls(() => {
      let filtered = polls.filter(poll => {
        let contestant = getName(poll.author).replace(" ", "").toUpperCase();
        if (contestant.includes(searchQuery)) return true;
      });
      return filtered;
    });
  }

  return (
    <>
      <header className='flex items-center justify-between'>
        <div className='heading_container'>
          <h2>Nagarjuna ICT Club - Photography Contest</h2>
        </div>
        <div className="header_search_area flex items-center gap-[1rem]">
          <p>Voting open</p>
          <Sentry color="#49b33e" size={24} speed={.5} animating={true} />
        </div>
        <div className="header_search_box flex">
          <input type="text" className="search_box" placeholder='Search Contestant' ref={searchBar}
            onChange={e => e.target.value ? null : filterPoll()} />
          <i className="ri-search-line search_btn flex items-center justify-center" onClick={filterPoll}></i>
        </div>
      </header>
      {/* <center>
        <h2> {"==>>"} Major Upgrage being carried out</h2>
        <p>Resumes on: Nov 2, 6 AM</p>
      </center> */}
      {showBackDrop && <CustomBackDrop />}
      {userName && <p className=' px-4 py-1 remaining_notice'>Remaining Vote Count for <b>{userName}</b> :- <span>{remainingSlots}</span></p>}
      {askMembershipId && <dialog className='flex items-center py-2 w-full h-full justify-center z-[100] backdrop:backdrop-blur-sm rounded-md'>
        <div className='flex flex-col gap-[1rem] border border-solid border-[#000] px-4 py-5'>
          <p>Enter your <em>Membership ID</em> to participate in this photography contest voting</p>
          <input
            type="text"
            name=""
            id=""
            onChange={e => setmidInput(e.target.value)}
            placeholder='Enter Membership ID'
            className='border border-solid border-[#000] px-1 py-2'
          />
          <button onClick={() => saveMembershipId()} className='border border-solid bg-primary text-[#fff] py-1'>SAVE</button>
        </div>
      </dialog>}
      {photoActive && <div className='poll_card flex single_poll py-3 px-1'>
        <img className='flex-1 w-50' src={photoActive?.url} />
        <div className='flex flex-col gap-1 details'>
          <span className='photo_id'>{photoActive.id}</span>
          <div className='author_section'>
            <i className="ri-user-6-fill"></i>
            <h2 className='author_name'>{getName(photoActive.author)} <span>{photoActive.author}</span></h2>
          </div>
          <div className='vote_section'>
            <i className="ri-heart-2-fill"></i>
            <h2 className='vote_count'>{photoActive.voters.length}<span>Likes</span></h2>
          </div>
          <h2 className='date_h2'>Uploaded on: {new Date(photoActive.createdAt).toUTCString()}</h2>
          <div className='card_footer'>
            <button className="vote_button" onClick={() => makeVote(photoActive.id)}>Vote <i className="ri-heart-add-fill"></i> </button>
            <button disabled className='votes_count'>
              <i className="ri-heart-2-fill"></i>
              {photoActive.voters.length}
              <Levels />
            </button>
            <button className='view_btn' onClick={() => location.href = "/"}>
              Back<i className="ri-link-unlink-m"></i>
            </button>
            <button className='copy_link' onClick={() => {
              navigator.clipboard.writeText("https://contest.nagarjunaictclub.com/?photo=" + photoActive.id)
              toast.success("Link Copied to Clipboard", {
                position: "bottom-center",
                type: "success"
              })
            }
            }>Copy Link <i className="ri-clipboard-line"></i></button>
          </div>
        </div>
      </div>
      }
      {<button className={`${topChartOn ? 'chart_on' : ''} mobile_btn`} onClick={() => setTCO(!topChartOn)}>{topChartOn ? <span><i className="ri-polaroid-2-line"></i> show all polls</span> : <span><i className="ri-line-chart-line"></i> show top chart</span>}</button>}
      <div className='poll_container py-3 '>
        {loading ? <div> <CustomBackDrop color={"white"} /> </div> :
          !askMembershipId &&
          <>
            {!loading && <div className={topChartOn ? 'top_charts active' : 'top_charts'}>
              <h2>Top Chart</h2>
              {getTopChart().map((top, key) => {

                if (top.voters.length > 0) {
                  return <div key={key} className='chart_card flex gap-1' onClick={() => location.href += "/?photo=" + top.id}>
                    <LazyLoadImage
                      alt={top.id}
                      effect="blur"
                      src={top.url}
                      width={'100'}
                       />
                    {/* <img src={top.url} width={'100'} /> */}
                    <p className='badge'>{top.voters.length} votes</p>
                    <div>
                      <span className='photo_id'>{top.id}</span>
                      <p className='author_name'>{top.author}<span>{getName(top.author)}</span></p>

                    </div>
                  </div>
                }
              })}
            </div>}

            <div className='all_polls scrollbar'>
              {
                filteredPolls.map((vlaue, k) => {
                  return <div key={k} className='poll_card flex flex-col gap-1'>
                    {/* <img src={vlaue?.url} /> */}
                    <LazyLoadImage
                      alt={vlaue.id}
                      effect="blur"
                      src={vlaue.url}
                    
                       />
                    <div className='flex flex-col gap-1'>
                      <span className='photo_id'>{vlaue.id}</span>
                      <div className='author_section'>
                        <i className="ri-user-6-fill"></i>
                        <h2 className='author_name'>{getName(vlaue.author)}
                          <span>{vlaue.author}</span>
                        </h2>
                      </div>
                      <div className='vote_section'>
                        <i className="ri-heart-2-fill"></i>
                        <h2 className='vote_count'>{vlaue.voters.length}<span>Likes</span></h2>
                      </div>
                      <h2 className='date_h2'>Uploaded on: {new Date(vlaue.createdAt).toUTCString()}</h2>
                      <div className='card_footer'>
                        <button className="vote_button" onClick={() => makeVote(vlaue.id)}>Vote <i className="ri-heart-add-fill"></i> </button>
                        <button disabled className='votes_count'>
                          <i className="ri-heart-2-fill"></i>
                          {vlaue.voters.length}
                          <Levels />
                        </button>
                        <button className='view_btn' onClick={() => location.href = "/?photo=" + vlaue.id}>
                          View <i className="ri-link-unlink-m"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                })
              }
            </div>
          </>

        }
      </div>
    </>
  )
}

const CustomBackDrop = (color?: any) => {
  console.log(color.color)
  return <div className='custom_backdrop' style={color && { backgroundColor: color.color }}>
    <Spinner />
  </div>
}

export default App
