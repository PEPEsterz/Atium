import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
// import { TWLogoBlack } from '../assets';


export default function Navbar() {
    return (
        <div className="flex justify-between">
            <div className="">
                <Link to="/">
                    <h1 className="sm:text-[35px] text-[30px] sm:h-10 font-bold text-[#fff]"><span className='text-[#4F46E5]'>Ati</span>um</h1>
                </Link>
            </div>

            <div className='flex'>
                {/* <button className='h-[40px] w-[180px] rounded-lg font-bold bg-black text-[#fff]'>Register as Admin</button> */}
                <ConnectButton showBalance={false} />
            </div>
    </div>
    )
}
