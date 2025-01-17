// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Registry.sol";

contract TimeLockedBackup {
    /*
    * @dev allow the user to sign a transaction with many nonces that allows them to transfer their eth (with a timelock) in the event that they lose access to their keys
    * @dev creates and the destroys the contract
    * @param _recipient - the default recipient of the funds if not set in registry
    * @param _notValidBefore - the default not valid before date if not set in registry
    * @param _notValidBefore - the default not valid after date if not set in registry
    * @param _registry - the registry contract that stores the user's requested info
    */
    constructor(
        address payable _recipient,
        uint _notValidBefore,
        uint _notValidAfter,
        Registry _registry
    ) public payable {
        (uint notValidBefore, uint notValidAfter, address payable recipient) = _registry.userRequest(msg.sender);
        if(recipient == address(0)) {
            // use default parameters as nothing is set in the registry contract
            require(_recipient != address(0), "TimeLockedBackup: recipient not set");
            require(block.timestamp >= _notValidBefore, "TimeLockedBackup: not valid yet");
            require(block.timestamp <= _notValidAfter, "TimeLockedBackup: expired");
            selfdestruct(_recipient);
        } else {
            // use the registry info
            require(recipient != address(0), "TimeLockedBackup: recipient not set");
            require(block.timestamp >= notValidBefore, "TimeLockedBackup: not valid yet");
            require(block.timestamp <= notValidAfter, "TimeLockedBackup: expired");
            selfdestruct(recipient);
        }
    }
}
