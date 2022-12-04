import React from "react";
import '../style/Header.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import { GiHamburgerMenu } from "react-icons/gi";

const Header = () => {
    return (
        <div>
            <div className="flex justify-between">
                <div className="flex ">
                    <Link to="/">
                        <p className="sm:text-[38px] text-[35px] font-bold text-[#fff]"><span className='text-[#4F46E5]'>Ati</span>um</p>
                    </Link>
                </div>
                    
                <div className='flex gap-x-2 sm:space-x-3 sm:font-bold'>
                    <nav className="text-[#fff] text-[25px] pt-2 font-medium lg:flex sm:flex flex-row hidden md:hidden space-x-6">
                        <Link to="/saving">
                            <p className="hover:opacity-60">Savings</p>
                        </Link>
                        <Link to="/allowance">
                            <p className="hover:opacity-60">Allowance</p>
                        </Link>
                        <Link to="/trustfund">
                            <p className="hover:opacity-60">TrustFund</p>
                        </Link>
                        <Link to="/gift">
                            <p className="hover:opacity-60">Gift</p> 
                        </Link> 
                    </nav>
                        
                    <div className="mt-2">
                        <ConnectButton/>
                    </div>

                    <div className="sm:hidden lg:hidden inline-block md:inline-block mt-1">
                        <GiHamburgerMenu className="h-12 w-12"/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header;