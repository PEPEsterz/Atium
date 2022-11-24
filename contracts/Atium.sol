//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "./AtiumReg.sol";
import "./AtiumToken.sol";
import "./AtiumPlan.sol";

error Atium_NotAmount();
error Atium_NotReceiverId();
error Atium_SavingsGoal_Not_Hit();
error Atium_NoWithdrawal();
error Atium_TransactionFailed();
error Atium_Cancelled();
error Atium_SavingsGoal_Exceeded(uint256 goal, uint256 rem);

contract Atium is AtiumPlan {

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

        SavingsList memory s = SavingsList ({
            id: _id,
            user: msg.sender,
            amount: savingsById[_id].amount,
            goal: savingsById[_id].goal,
            time: savingsById[_id].time
        });

        savingsById[_id] = s;

        (bool sent, ) = payable(address(this)).call{value: msg.value}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }

    function allowance(uint256 _id, uint256 _amount) external payable inAllowance(_id) {
        if (msg.value != _amount) {
            revert Atium_NotAmount();
        }
        allowanceById[_id].deposit += _amount;
        allowanceBalance[_id] += _amount;

        AllowanceList memory al = AllowanceList ({
            id: _id,
            sender: msg.sender,
            receiver: allowanceById[_id].receiver,
            deposit: allowanceById[_id].deposit,
            startDate: allowanceById[_id].startDate,
            withdrawalAmount: allowanceById[_id].withdrawalAmount,
            withdrawalInterval: allowanceById[_id].withdrawalInterval
        });

        allowanceById[_id] = al;

        (bool sent, ) = payable(address(this)).call{value: msg.value}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }

    function trustfund(uint256 _id, uint256 _amount) external payable inTrustfund(_id) {
        if (msg.value != _amount) {
            revert Atium_NotAmount();
        }
        trustfundById[_id].amount += _amount;
        trustfundBalance[_id] += _amount;

        TrustFundList memory t = TrustFundList ({
            id: _id,
            sender: msg.sender,
            receiver: trustfundById[_id].receiver,
            amount: trustfundById[_id].amount,
            startDate: trustfundById[_id].startDate,
            withdrawalAmount: trustfundById[_id].withdrawalAmount,
            withdrawalInterval: trustfundById[_id].withdrawalInterval
        });

        trustfundById[_id] = t;

        (bool sent, ) = payable(address(this)).call{value: msg.value}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }

    function gift(uint256 _id, uint256 _amount) external payable inGift(_id) {
        if (msg.value != _amount) {
            revert Atium_NotAmount();
        }
        giftById[_id].amount += _amount;

        GiftList memory g = GiftList ({
            id: _id,
            sender: msg.sender,
            receiver: giftById[_id].receiver,
            date: giftById[_id].date,
            amount: giftById[_id].amount
        });

        giftById[_id] = g;

        (bool sent, ) = payable(address(this)).call{value: msg.value}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }


    ///////////////////////////////////////////////////////////
    //////////// (RECEIVER) WITHDRAWAL FUNCTIONS //////////////
    ///////////////////////////////////////////////////////////

    function w_save(uint256 _id) external inSavings(_id) {
        if (savingsById[_id].amount < savingsById[_id].goal || block.timestamp < savingsById[_id].time) {
            revert Atium_SavingsGoal_Not_Hit();
        }
        if (savingsCancelled[_id]) {
            revert Atium_Cancelled();
        }
        savingsCancelled[_id] = true;

        (bool sent, ) = payable(msg.sender).call{value: savingsById[_id].amount}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }

    function w_allowance(uint256 _id) external rAllowance(_id) {
        uint256 witAmount;
        
        if (allowanceBalance[_id] == 0) {
            revert Atium_NoWithdrawal();
        }

        if (allowanceBalance[_id] < allowanceById[_id].withdrawalAmount) {
            witAmount = allowanceBalance[_id];
        }

        if (allowanceBalance[_id] >= allowanceById[_id].withdrawalAmount) {
            witAmount = allowanceById[_id].withdrawalAmount;
        }

        allowanceBalance[_id] -= witAmount;
        (bool sent, ) = payable(msg.sender).call{value: witAmount}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }

    function w_trustfund(uint256 _id) external rTrustfund(_id) {
        uint256 witAmount;

        if (trustfundBalance[_id] == 0) {
            revert Atium_NoWithdrawal();
        }

        if (trustfundBalance[_id] < trustfundById[_id].withdrawalAmount) {
            witAmount = trustfundBalance[_id];
        }

        if (trustfundBalance[_id] >= trustfundById[_id].withdrawalAmount) {
            witAmount = trustfundById[_id].withdrawalAmount;
        }

        trustfundBalance[_id] -= witAmount;
        (bool sent, ) = payable(msg.sender).call{value: witAmount}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }

    function w_gift(uint256 _id) external rGift(_id) {
        giftCancelled[_id] = true;
        (bool sent, ) = payable(msg.sender).call{value: giftById[_id].amount}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }


    ///////////////////////////////////////////////////////////
    ///////////////// CANCEL PLANS FUNCTIONS //////////////////
    ///////////////////////////////////////////////////////////

    function cancelSavings(uint256 _id) external {
        if (savingsCancelled[_id]) {
            revert Atium_Cancelled();
        }
        savingsCancelled[_id] = true;

        (bool sent, ) = payable(msg.sender).call{value: savingsById[_id].amount}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }

    function cancelAllowance(uint256 _id) external {
        if (allowanceCancelled[_id]) {
            revert Atium_Cancelled();
        }
        allowanceCancelled[_id] = true;
        
        (bool sent, ) = payable(msg.sender).call{value: allowanceById[_id].deposit}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }
    }

    function cancelTrustfund(uint256 _id) external {
        if (trustfundCancelled[_id]) {
            revert Atium_Cancelled();
        }
        trustfundCancelled[_id] = true;
        
        (bool sent, ) = payable(msg.sender).call{value: trustfundById[_id].amount}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }           
    }

    function cancelGift(uint256 _id) external {
        if (giftCancelled[_id]) {
            revert Atium_Cancelled();
        }
        giftCancelled[_id] = true;
        
        (bool sent, ) = payable(msg.sender).call{value: giftById[_id].amount}("");
        if (!sent) {
            revert Atium_TransactionFailed();
        }          
    }


    ///////////////////////////////////////////////////////
    ///////////////// RECEIVER MODIFIERS //////////////////
    ///////////////////////////////////////////////////////

    modifier rAllowance(uint256 _id) {
        if (allowanceById[_id].receiver != msg.sender) {
            revert Atium_NotReceiverId();
        }
        _;
    }

    modifier rTrustfund(uint256 _id) {
        if (trustfundById[_id].receiver != msg.sender) {
            revert Atium_NotReceiverId();
        }
        _;
    }

    modifier rGift(uint256 _id) {
        if (giftById[_id].receiver != msg.sender) {
            revert Atium_NotReceiverId();
        }
        _;
    }


    receive() payable external {}
}

  