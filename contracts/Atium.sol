//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./AtiumPlan.sol";
import "./Array.sol";

error Atium_NotAmount();
error Atium_NotReceiverId();
error Atium_SavingsGoal_Not_Hit();
error Atium_NoWithdrawal();
error Atium_TransactionFailed();
error Atium_Cancelled();
error Atium_SavingsGoal_Exceeded(uint256 goal, uint256 rem);

contract Atium is AtiumPlan {
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.UintSet;
    using Array for uint256[];

    mapping(uint256 => bool) private savingsCancelled;
    mapping(uint256 => bool) private allowanceCancelled;
    mapping(uint256 => bool) private trustfundCancelled;
    mapping(uint256 => bool) private giftCancelled;

    mapping(uint256 => uint256) private allowanceBalance;
    mapping(uint256 => uint256) private trustfundBalance;


    ///////////////////////////////////////////////////////
    ///////////////// DEPOSIT FUNCTIONS ///////////////////
    ///////////////////////////////////////////////////////

    function save(uint256 _id, uint256 _amount) external payable inSavings(_id) {
        if (_id == 0 || _amount == 0) {
            revert Atium_ZeroInput();
        }
        if (msg.value != _amount) {
            revert Atium_NotAmount();
        }
        if (_amount + savingsById[_id].amount > savingsById[_id].goal) {
            revert Atium_SavingsGoal_Exceeded({
                goal: savingsById[_id].goal,
                rem: savingsById[_id].goal - savingsById[_id].amount
            });
        }
 
        savingsById[_id].amount += _amount;


        addrToActiveAllowance[msg.sender].remove(_id);    
        addrToActiveAllowance[msg.sender].add(_id); 

        (bool sent, ) = payable(address(this)).call{value: msg.value}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }

    function allowance(uint256 _id, uint256 _amount) external payable inAllowance(_id) {
        if (_id == 0 || _amount == 0) {
            revert Atium_ZeroInput();
        }
        if (msg.value != _amount) {
            revert Atium_NotAmount();
        }

        allowanceById[_id].deposit += _amount;
        allowanceBalance[_id] += _amount;

        addrToActiveAllowance[msg.sender].remove(_id);    
        addrToActiveAllowance[msg.sender].add(_id); 

        (bool sent, ) = payable(address(this)).call{value: msg.value}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }

    function trustfund(uint256 _id, uint256 _amount) external payable inTrustfund(_id) {
        if (_id == 0 || _amount == 0) {
            revert Atium_ZeroInput();
        }
        if (msg.value != _amount) {
            revert Atium_NotAmount();
        }

        trustfundById[_id].amount += _amount;
        trustfundBalance[_id] += _amount;

        addrToActiveTrustfund[msg.sender].remove(_id);    
        addrToActiveTrustfund[msg.sender].add(_id); 

        (bool sent, ) = payable(address(this)).call{value: msg.value}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }

    function gift(uint256 _id, uint256 _amount) external payable inGift(_id) {
        if (_id == 0 || _amount == 0) {
            revert Atium_ZeroInput();
        }
        if (msg.value != _amount) {
            revert Atium_NotAmount();
        }

        giftById[_id].amount += _amount;

        addrToActiveGift[msg.sender].remove(_id);    
        addrToActiveGift[msg.sender].add(_id);

        (bool sent, ) = payable(address(this)).call{value: msg.value}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }


    ///////////////////////////////////////////////////////////
    //////////// (RECEIVER) WITHDRAWAL FUNCTIONS //////////////
    ///////////////////////////////////////////////////////////

    function w_save(uint256 _id) external {
        if (savingsById[_id].amount < savingsById[_id].goal || block.timestamp < savingsById[_id].time) {
            revert Atium_SavingsGoal_Not_Hit();
        }
        if (savingsCancelled[_id]) {
            revert Atium_Cancelled();
        }
        userS_Ids[savingsById[_id].user].removeElement(_id);
        savingsCancelled[_id] = true;
        addrToActiveAllowance[savingsById[_id].user].remove(_id);

        (bool sent, ) = payable(savingsById[_id].user).call{value: savingsById[_id].amount}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }

    function w_allowance(uint256 _id) external {
        uint256 witAmount;
        
        if (allowanceBalance[_id] == 0) {
            revert Atium_NoWithdrawal();
        }

        uint256 a = block.timestamp;
        uint256 b = allowanceDate[_id];
        uint256 c = allowanceById[_id].withdrawalInterval;

        if ((a - b) < c) {
            revert Atium_OnlyFutureDate();
        }

        uint256 d = (a - b) / c;
        allowanceDate[_id] += (d * c);
        
        if (allowanceBalance[_id] < allowanceById[_id].withdrawalAmount) {
            witAmount = allowanceBalance[_id];
        }

        if (allowanceBalance[_id] >= allowanceById[_id].withdrawalAmount) {
            witAmount = d * allowanceById[_id].withdrawalAmount;
        }

        allowanceBalance[_id] -= witAmount;
        addrToActiveAllowance[allowanceById[_id].receiver].remove(_id);    
        addrToActiveAllowance[allowanceById[_id].receiver].add(_id);

        (bool sent, ) = payable(allowanceById[_id].receiver).call{value: witAmount}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }

    function w_trustfund(uint256 _id) external {
        uint256 witAmount;

        if (trustfundBalance[_id] == 0) {
            revert Atium_NoWithdrawal();
        }

        uint256 a = trustfundById[_id].startDate;
        uint256 b = trustfundDate[_id];
        uint256 c = trustfundById[_id].withdrawalInterval;

        uint256 d = (a - b) / c;
        trustfundDate[_id] += (d * c);

        if (trustfundBalance[_id] < trustfundById[_id].withdrawalAmount) {
            witAmount = trustfundBalance[_id];
        }

        if (trustfundBalance[_id] >= trustfundById[_id].withdrawalAmount) {
            witAmount = d * trustfundById[_id].withdrawalAmount;
        }

        trustfundBalance[_id] -= witAmount;
        addrToActiveTrustfund[trustfundById[_id].receiver].remove(_id);    
        addrToActiveTrustfund[trustfundById[_id].receiver].add(_id); 
        (bool sent, ) = payable(trustfundById[_id].receiver).call{value: witAmount}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }

    function w_gift(uint256 _id) external {
        userG_Ids[giftById[_id].receiver].removeElement(_id);

        giftCancelled[_id] = true;
        addrToActiveGift[giftById[_id].receiver].remove(_id);    

        (bool sent, ) = payable(giftById[_id].receiver).call{value: giftById[_id].amount}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }


    ///////////////////////////////////////////////////////
    ///////////////// GETTERS FUNCTIONS  //////////////////
    ///////////////////////////////////////////////////////

    function getSavingsBalance(uint256 _id) public view returns (uint256) {
        return savingsById[_id].amount;
    }

    function getAllowanceBalance(uint256 _id) public view returns (uint256) {
        return allowanceBalance[_id];
    }

    function getTrustfundBalance(uint256 _id) public view returns (uint256) {
        return trustfundBalance[_id];
    }

    function getGiftBalance(uint256 _id) public view returns (uint256) {
        return giftById[_id].amount;     
    }

    receive() payable external {}
}