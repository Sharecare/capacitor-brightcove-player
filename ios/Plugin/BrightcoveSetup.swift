import Foundation
import BrightcovePlayerSDK

public class BrightcoveSetup {
    public let sharedSDKManager: BCOVPlayerSDKManager = BCOVPlayerSDKManager.shared()!
    public let playbackService: BCOVPlaybackService

    init(accountId: String, policyKey: String) {
        playbackService = BCOVPlaybackService(accountId: accountId, policyKey: policyKey)
    }

    // findVideoWithVideoID: was removed in SDK 6.13.0; the video ID now goes in the configuration dictionary
    func findVideo(id: String, completion: @escaping (BCOVVideo?, [AnyHashable: Any]?, Error?) -> Void) {
        let configuration: [AnyHashable: Any] = [kBCOVPlaybackServiceConfigurationKeyAssetID: id]
        playbackService.findVideo(withConfiguration: configuration, queryParameters: nil, completion: completion)
    }
}
