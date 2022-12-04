import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
// import { TWLogoBlack } from '../assets';
import { BsTwitter } from "react-icons/bs";
import { BsGithub } from "react-icons/bs";


export default function Navbar() {
    return (
        <div className="flex justify-between space">
            <div className="sm:h-10 h-7">
                <Link to="/">
                    <h1 className="sm:text-[35px] text-[35px] sm:h-full h-full font-bold text-[#fff]"><span className='text-[#4F46E5]'>Ati</span>um</h1>
                </Link>
            </div>

            <div className='flex space-x-10'>
                <div className="text-[#FFF] sm:flex flex-row hidden mt-4 h-7 cursor-pointer">
                    <a href="https://twitter.com" target="_blank">
                        <BsTwitter className='w-10 mr-3 h-full'/>
                    </a>
                    <a href="https://github.com/galadd/Atium" target="_blank">
                        <BsGithub className='w-10 h-full ml-3'/>
                    </a>
                </div>
                {/* <button className='h-[40px] w-[180px] rounded-lg font-bold bg-black text-[#fff]'>Register as Admin</button> */}
                <div className="mt-2">
                    <ConnectButton showBalance={false} />
                </div>
            </div>
    </div>
    )
}
