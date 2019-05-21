<?php
/**
 * Created by Mojtaba Khodakhah.
 * Date: 15-Apr-19
 * Time: 2:54 AM
 * Project: NodCMS
 * Website: http://www.nodcms.com
 */

defined('BASEPATH') OR exit('No direct script access allowed');
class AboutHooks extends NodcmsHooks
{
    private function defines()
    {
        $this->CI->load->add_package_path(APPPATH."third_party/About");
        $this->CI->load->model("About_model");
    }

    /**
     * Backend setups
     */
    function backend()
    {
        define('ABOUT_ADMIN_URL',base_url().'admin-about/');
        $this->defines();

        if($this->CI->userdata["group_id"]==1){
            $addon_sidebar = array(
                'aboutme_list' => array(
                    'url'=>ABOUT_ADMIN_URL."profiles",
                    'icon'=>'far fa-id-card',
                    'title'=>_l("AboutMe profiles", $this->CI),
                ),
            );
            $this->CI->addToAdminSidebar($addon_sidebar);
        }
    }

    /**
     * Frontend setups
     *
     * @param $lang
     */
    function preset($lang)
    {
        $this->defines();
    }

}