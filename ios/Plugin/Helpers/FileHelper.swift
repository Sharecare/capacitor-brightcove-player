//
//  Utilities.swift
//  OfflinePlayer
//
//  Copyright © 2020 Brightcove, Inc. All rights reserved.
//

import UIKit

class FileHelper: NSObject {
    class func directorySize(folderPath: String) -> Int {
        var _directorySize: Int = 0
        do {
            let filesArray = try FileManager.default.subpathsOfDirectory(atPath: folderPath)
            
            for fileName in filesArray {
                let path = folderPath + "/" + fileName
                let fileDictionary = try FileManager.default.attributesOfItem(atPath: path)
                guard let filesize = fileDictionary[FileAttributeKey.size] as? Int else {
                    return 0
                }
                _directorySize = _directorySize + filesize
            }
        } catch let error {
            print("\(error.localizedDescription)")
        }
        
        return _directorySize
        
    }
}
