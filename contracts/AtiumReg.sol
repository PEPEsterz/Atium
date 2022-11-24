//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";

/**
@title - Atium Registration 
@notice - This contract is used to manage the atium signup and atium members profile. For now, 
            the purpose of this contract is to reward atium tokens
@dev - The members can signup and update their profile.
@author - Gbolahan Fakorede
 */

contract AtiumReg {
    using Counters for Counters.Counter;
    Counters.Counter private _ids;

    ///@notice - Error raised when a member already exists.
    error Atium__MemberExists();

    ///@notice -  Error raised when a member does not exist.
    error Atium__NotMember();

    /**
    @dev - Mapping to check if address is an Atium account
    */
    mapping(address => bool) public member;

    /**
      @notice - Mapping of member id to Member struct
    */
    mapping(uint256 => Member) private idToMember;

    /**
      @notice - Mapping of member id to Member address
    */
    mapping(uint256 => address) public addressById;

    /**
      @notice - Structure of an Artist
      @param - id: Id for each artist
      @param - dateJoined: Date artist joined platform
      @param - artistAddress: address of the artist
      @param - artistDetails: Artist details
     */
    struct Member {
        uint id;
        address userAddress;
    }
    /**
    @notice - Event for new artist sign-up
     */
    event newArtistJoined(
        uint id,
        address userAddress
    );

    /**
   @notice - Array to store all artists
    */
    Member[] public members;

    /**
   @notice - Function for new member sign-up
    */

    function memberSignUp() external onlyNonMember {
        _ids.increment();

        Member memory m = Member({
            id: _ids.current(),
            userAddress: msg.sender
        });
        members.push(m);

        member[msg.sender] = true;
        idToMember[_ids.current()] = m;
        addressById[_ids.current()] = msg.sender;

        emit newArtistJoined(
            _ids.current(),
            msg.sender
        );
    }

    /**
    @notice - Function to get all artists
    */
    function getAllMembers() external view returns (Member[] memory) {
        return members;
    }

    ///MODIFIERS

    ///@notice - Modifier to check if an address is a member
    modifier onlyMember {
        if (member[msg.sender] == false) {
            revert Atium__MemberExists();
        }
        _;
    }

    ///@notice - Modifier to check if an address is not a member
    modifier onlyNonMember {
        if (member[msg.sender] == true) {
            revert Atium__NotMember();
        }
        _;
    }
}